import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import stripe from '../../configs/stripeConfig.js';

export const createAppointment = async (req, res) => {
  const clientId = req.user.userId;
  const { appointmentSubject, consultationId, appointmentType, date } =
    req.body;
  if (!appointmentSubject || !consultationId || !appointmentType || !date) {
    throw new BadRequestError('Please provide all required fields');
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(consultationId) },
  });

  if (!consultation) {
    throw new BadRequestError('No consultation Found');
  }

  if (consultation.price > 0) {
    const lineItems = [
      {
        price_data: {
          currency: 'sar',
          product_data: {
            name: consultation.name,
          },
          unit_amount: Math.round(consultation.price * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.BACKEND_URL}/api/v1/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/consultations/cancel`,
      metadata: {
        clientId,
        consultationId,
        date,
        appointmentSubject,
        appointmentType,
      },
    });

    res.status(StatusCodes.OK).json({ url: session.url });
  }

  const appointment = await prisma.appointment.create({
    data: {
      appointmentSubject,
      consultationId: parseInt(consultationId),
      appointmentType,
      date: new Date(date).toISOString(),
    },
  });
};

export const handlePaidAppointment = async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    throw new BadRequestError('Session ID is missing');
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const clientId = session.metadata.clientId;
  const consultationId = session.metadata.consultationId;
  const date = session.metadata.date;
  const appointmentType = session.metadata.appointmentType;
  const appointmentSubject = session.metadata.appointmentSubject;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!client) {
    throw new BadRequestError('Invalid client ID');
  }

  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(consultationId, 10) },
    include: { employees: true },
  });

  if (!consultation) {
    throw new BadRequestError('Consultation not found.');
  }

  if (!consultation.employees || consultation.employees.length === 0) {
    throw new BadRequestError('No employees assigned to this consultation.');
  }

  const order = await prisma.order.create({
    data: {
      clientId,
      totalPrice: consultation.price,
      status: 'PENDING',
      orderItems: {
        create: [
          {
            serviceItemId: null,
            priceAtTime: consultation.price,
            quantity: 1,
            consultationId: consultation.id,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentId: session.payment_intent,
      clientId,
      orderId: order.id,
      provider: 'Stripe',
      method: session.payment_method_types[0],
      status: 'SUCCESS',
      amount: consultation.price,
      currency: 'sar',
    },
  });

  const appointment = await prisma.appointment.create({
    data: {
      appointmentSubject,
      consultationId: parseInt(consultationId, 10),
      appointmentType,
      date: new Date(date).toISOString(),
    },
  });

  const assignedEmployee = consultation.employees[0];
  const chat = await prisma.chat.create({
    data: {
      serviceItemId: null,
      clientId,
      employeeId: assignedEmployee.id,
      appointmentId: appointment.id,
    },
  });

  const redirectUrl = `${process.env.FRONTEND_URL}/myOrders/${order.id}`;
  // res.redirect(redirectUrl);
  res.status(StatusCodes.OK).json({ order, chat, appointment });
};

export const getAllAppointments = async (req, res) => {
  const appointments = await prisma.appointment.findMany({});
  res.status(StatusCodes.OK).json({ appointments });
};

export const getAppointmentById = async (req, res) => {
  const { id: appointmentId } = req.params;
  const appointment = await prisma.appointment.findUnique({
    where: { id: parseInt(appointmentId) },
  });
  if (!appointment) {
    throw new NotFoundError('No appointments found with this id');
  }
  res.status(StatusCodes.OK).json({ appointment });
};
