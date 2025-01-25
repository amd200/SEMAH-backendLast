import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import stripe from '../../configs/stripeConfig.js';
import { notifyEmployee } from '../../configs/websocketConfig.js';
import UnauthorizedError from '../../errors/unauthorized.js';

export const addToCart = async (req, res) => {
  const { serviceItemId, quantity } = req.body;
  if (!serviceItemId || !quantity) {
    throw new BadRequestError('No serviceItemId provided');
  }
  const clientId = req.user.userId;

  if (!req.user.role) {
    throw new UnauthorizedError('Unauthorized to access this route');
  }

  // Validate clientId
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!client) {
    throw new BadRequestError('Invalid clientId');
  }

  // Check if the service item exists
  const serviceItem = await prisma.serviceItem.findUnique({
    where: {
      id: parseInt(serviceItemId, 10),
    },
  });
  if (!serviceItem) {
    throw new NotFoundError('ServiceItem not found');
  }

  // Add to cart
  const cartItem = await prisma.cart.upsert({
    where: {
      clientId_serviceItemId: {
        clientId,
        serviceItemId: parseInt(serviceItemId, 10),
      },
    },
    update: {
      quantity: { increment: quantity },
      priceAtTime: serviceItem.price,
    },
    create: {
      clientId,
      serviceItemId: parseInt(serviceItemId, 10),
      quantity,
      priceAtTime: serviceItem.price,
    },
  });
  res.status(StatusCodes.CREATED).json(cartItem);
};

export const getCart = async (req, res) => {
  const clientId = req.user.userId;

  if (!req.user.role) {
    throw new UnauthorizedError('Unauthorized to access this route');
  }

  const cartItems = await prisma.cart.findMany({
    where: {
      clientId,
    },
    include: {
      serviceItem: {
        select: {
          name: true,
          price: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json(cartItems);
};

export const removeFromCart = async (req, res) => {
  const { serviceItemId } = req.params;

  const clientId = req.user.userId;

  await prisma.cart.delete({
    where: {
      clientId_serviceItemId: {
        clientId,
        serviceItemId: parseInt(serviceItemId, 10),
      },
    },
  });

  res.status(StatusCodes.OK).json({ message: 'Item removed from cart' });
};

export const checkoutWithStripe = async (req, res) => {
  const clientId = req.user.userId;

  const cartItems = await prisma.cart.findMany({
    where: { clientId },
    include: { serviceItem: true },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'sar',
      product_data: {
        name: item.serviceItem.name,
      },
      unit_amount: Math.round(item.serviceItem.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    payment_method_options: {
      card: {
        request_three_d_secure: 'any',
      },
    },
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.BACKEND_URL}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/api/v1/payments/cancel`,
    metadata: {
      clientId,
    },
  });

  res.status(StatusCodes.OK).json({ url: session.url });
};

export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  await prisma.cart.deleteMany({
    where: {
      clientId: userId,
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Cart cleared' });
};

export const handleSuccess = async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    throw new BadRequestError('Session ID is missing');
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const clientId = session.metadata.clientId;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!client) {
    throw new BadRequestError('Invalid client ID');
  }

  const cartItems = await prisma.cart.findMany({
    where: { clientId },
    include: { serviceItem: { include: { employees: true } } },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.serviceItem.price,
    0
  );

  const order = await prisma.order.create({
    data: {
      clientId,
      totalPrice,
      status: 'PENDING',
      orderItems: {
        create: cartItems.map((item) => ({
          serviceItemId: item.serviceItemId,
          quantity: item.quantity,
          priceAtTime: item.serviceItem.price,
        })),
      },
    },
  });

  // Create the payment record
  const payment = await prisma.payment.create({
    data: {
      paymentId: session.payment_intent,
      clientId,
      orderId: order.id,
      provider: 'Stripe',
      method: session.payment_method_types[0],
      status: 'SUCCESS',
      amount: totalPrice,
      currency: 'sar',
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PENDING' },
  });

  const chats = [];
  for (const item of cartItems) {
    const serviceItem = item.serviceItem;

    if (!serviceItem || serviceItem.employees.length === 0) {
      continue; // Skip if no employee is associated
    }

    const assignedEmployee = serviceItem.employees[0];

    const chat = await prisma.chat.create({
      data: {
        serviceItemId: serviceItem.id,
        clientId,
        employeeId: assignedEmployee.id,
      },
    });

    chats.push(chat);

    const employeeOrderNotification = `There's a new order with id: ${order.id} has been placed!`;

    const employeeNotification = await prisma.notification.create({
      data: {
        content: employeeOrderNotification,
        employeeId: assignedEmployee.id,
      },
    });

    notifyEmployee(assignedEmployee.id, {
      message: `New chat created for ServiceItem: ${serviceItem.name}`,
      chatId: chat.id,
    });
  }

  const clientOrderNotification = `Your order with id ${order.id} has been completed successfully!`;

  const clientNotification = await prisma.notification.create({
    data: {
      content: clientOrderNotification,
      clientId,
    },
  });

  await prisma.cart.deleteMany({
    where: { clientId },
  });

  // Return the success response
  // res.status(StatusCodes.OK).json({
  //   message: 'Order completed successfully',
  //   order,
  //   payment,
  //   chats,
  // });

  const redirectUrl = `${process.env.FRONTEND_URL}/myOrders/${order.id}`;
  res.redirect(redirectUrl);
};

export const getAllOrders = async (req, res) => {
  const orders = await prisma.order.findMany();
  res.status(StatusCodes.OK).json(orders);
};

export const getAllPayments = async (req, res) => {
  const payments = await prisma.payment.findMany();
  res.status(StatusCodes.OK).json(payments);
};

export const getAuthenticatedUserOrders = async (req, res) => {
  const userId = req.user.userId;

  console.log(userId);

  const orders = await prisma.order.findMany({
    where: {
      clientId: userId,
    },
    include: {
      commissioners: { select: { id: true, name: true, phoneNumber: true } },
      orderItems: {
        select: {
          serviceItem: true,
          consultation: true,
        },
      },
    },
  });

  if (!orders) {
    throw new NotFoundError(`No Orders found!`);
  }

  res.status(StatusCodes.OK).json({ orders });
};

export const getOrderById = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: {
      commissioners: { select: { id: true, name: true, phoneNumber: true } },
      orderItems: {
        select: {
          serviceItem: true,
        },
      },
    },
  });
  if (!order) {
    throw new NotFoundError('No orders found with this id');
  }

  res.status(StatusCodes.OK).json({ order });
};
