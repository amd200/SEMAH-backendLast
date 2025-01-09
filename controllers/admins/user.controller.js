import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const getAllAdmins = async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.status(StatusCodes.OK).json(admins);
};

export const getAdminById = async (req, res) => {
  const { id: adminId } = req.params;
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!admin) {
    throw new NotFoundError('Admin not found');
  }
  res.status(StatusCodes.OK).json(admin);
};

export const deleteAdmin = async (req, res) => {
  const { id: adminId } = req.params;
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });
  if (!admin) {
    throw new NotFoundError('Admin not found');
  }
  const deleteAdmin = await prisma.admin.delete({
    where: {
      id: adminId,
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Admin deleted successfully' });
};

export const showCurrentAdmin = async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!admin) {
    throw new NotFoundError('Admin not found');
  }
  res.status(StatusCodes.OK).json(admin);
};
