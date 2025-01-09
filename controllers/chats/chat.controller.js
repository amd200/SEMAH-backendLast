import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const getChats = async (req, res) => {
  const { userId } = req.user;

  console.log('Fetching chats for user:', { userId });

  try {
    // Check if the user is a client
    const client = await prisma.client.findUnique({
      where: { id: userId },
    });

    if (client) {
      // User is a client, fetch chats where the user is the client
      const chats = await prisma.chat.findMany({
        where: { clientId: userId },
        include: {
          serviceItem: { select: { name: true } }, // Include service item details
          employee: { select: { name: true, email: true } }, // Include employee details
        },
      });

      console.log('Chats for client retrieved:', chats);

      return res.status(StatusCodes.OK).json(chats);
    }

    // Check if the user is an employee
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
    });

    if (employee) {
      // User is an employee, fetch chats where the user is the employee
      const chats = await prisma.chat.findMany({
        where: { employeeId: userId },
        include: {
          serviceItem: { select: { name: true } }, // Include service item details
          client: { select: { name: true, email: true } }, // Include client details
        },
      });

      console.log('Chats for employee retrieved:', chats);

      return res.status(StatusCodes.OK).json(chats);
    }

    // If the user is neither a client nor an employee
    throw new BadRequestError('Invalid user role');
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Failed to fetch chats');
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  const chat = await prisma.chat.findUnique({
    where: { id: parseInt(chatId, 10) },
  });

  if (
    !chat ||
    (role === 'CLIENT' && chat.clientId !== userId) ||
    (role === 'EMPLOYEE' && chat.employeeId !== userId)
  ) {
    throw new NotFoundError('Chat not found or access denied');
  }

  const messages = await prisma.message.findMany({
    where: { chatId: parseInt(chatId, 10) },
    orderBy: { createdAt: 'asc' },
  });

  res.status(StatusCodes.OK).json(messages);
};

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const sender = req.user.userId;
  const role = req.user.role;

  const chat = await prisma.chat.findUnique({
    where: { id: parseInt(chatId, 10) },
  });

  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  if (
    role !== 'ADMIN' &&
    sender !== chat.clientId &&
    sender !== chat.employeeId
  ) {
    throw new BadRequestError(
      'You are not authorized to send messages in this chat'
    );
  }

  const message = await prisma.message.create({
    data: {
      chatId: parseInt(chatId, 10),
      sender,
      content,
    },
  });

  res.status(StatusCodes.CREATED).json(message);
};

export const getAllChats = async (req, res) => {
  const chats = await prisma.chat.findMany({
    include: {
      serviceItem: { select: { name: true } }, // Include service item details
      client: { select: { name: true, email: true } }, // Include client details
      employee: { select: { name: true, email: true } }, // Include employee details
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: chats,
  });
};

export const getChatByUserId = async (req, res) => {
  const { userId } = req.params;

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ clientId: userId }, { employeeId: userId }],
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: chats,
  });
};
