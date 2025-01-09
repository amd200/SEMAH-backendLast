import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const getAllClients = async (req, res) => {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phoneNumber: true,
      customerClass: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isWhatsAppVerified: true,
      createdAt: true,
      updatedAt: true,
      companies: {
        select: {
          id: true,
          name: true,
          commercialNumber: true,
          taxNumber: true,
          address: true,
          owner: true,
          ownerEmail: true,
          ownerPhoneNumber: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json(clients);
};

export const getClientById = async (req, res) => {
  const { id: clientId } = req.params;
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phoneNumber: true,
      customerClass: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isWhatsAppVerified: true,
      createdAt: true,
      updatedAt: true,
      companies: {
        select: {
          id: true,
          name: true,
          commercialNumber: true,
          taxNumber: true,
          address: true,
          owner: true,
          ownerEmail: true,
          ownerPhoneNumber: true,
        },
      },
    },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  res.status(StatusCodes.OK).json(client);
};

export const updateClient = async (req, res) => {
  const { id: clientId } = req.params;
  const { name, companyName, email, phoneNumber, customerClass } = req.body;

  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }

  const updatedClient = await prisma.client.update({
    where: {
      id: clientId,
    },
    data: {
      name,
      companyName,
      email,
      phoneNumber,
      customerClass,
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phoneNumber: true,
      customerClass: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isWhatsAppVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.status(StatusCodes.OK).json({
    message: 'Client updated successfully',
    client: updatedClient,
  });
};

export const deleteClient = async (req, res) => {
  const { id: clientId } = req.params;
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  const deleteClient = await prisma.client.delete({
    where: {
      id: clientId,
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Client deleted successfully' });
};

export const showCurrentClient = async (req, res) => {
  const client = await prisma.client.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phoneNumber: true,
      customerClass: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isWhatsAppVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  res.status(StatusCodes.OK).json(client);
};
