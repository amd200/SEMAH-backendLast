import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import bcrypt from 'bcryptjs';
import UnauthenticatedError from '../../errors/unauthenticated.js';
import createTokenUser from '../../utils/createTokenUser.js';
import { attachCookiesToResponse } from '../../utils/jwt.js';
import UnauthorizedError from '../../errors/unauthorized.js';

export const createCommissioner = async (req, res) => {
  const { name, identityNumber, phoneNumber, password, serviceItemId } =
    req.body;
  const clientId = req.user.userId;
  if (!name || !identityNumber || !phoneNumber || !password) {
    throw new BadRequestError('Please provide all required fields');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const commissioner = await prisma.commissioner.create({
    data: {
      name,
      identityNumber,
      phoneNumber,
      password: hashedPassword,
      serviceItemId,
      clientId,
    },
  });

  res.status(StatusCodes.OK).json({ commissioner });
};

export const loginCommissioner = async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    throw new BadRequestError(
      'Please provide a valid phone number and password'
    );
  }

  // Check if the commissioner is exists
  const commissioner = await prisma.commissioner.findFirst({
    where: { phoneNumber },
  });

  // Comparing passwords
  const isPasswordCorrect = await bcrypt.compare(
    password,
    commissioner.password
  );
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const commissionerToken = createTokenUser(commissioner);
  attachCookiesToResponse({ res, user: commissionerToken });
  res
    .status(StatusCodes.OK)
    .json({ message: 'Login Success', user: commissionerToken });
};

export const getAllCommissioners = async (req, res) => {
  const clientId = req.user.userId;
  if (!req.user.role) {
    throw new UnauthorizedError('Unauthorized to access this route');
  }
  if (!clientId) {
    throw new BadRequestError('No client ID is logged in!');
  }
  const client = await prisma.commissioner.findMany({
    where: {
      clientId,
    },
  });

  res.status(StatusCodes.OK).json({ client });
};

export const getCommissionerById = async (req, res) => {
  const clientId = req.user.userId;
  if (!req.user.role) {
    throw new UnauthorizedError('Unauthorized to access this route');
  }
  const { id: commissionerId } = req.params;
  const commissioner = await prisma.commissioner.findFirst({
    where: { id: parseInt(commissionerId) },
  });
  if (!commissioner) {
    throw new NotFoundError(`No commissioners Found!`);
  }
  res.status(StatusCodes.OK).json({ commissioner });
};

export const updateCommissioner = async (req, res) => {
  const { name, identityNumber, phoneNumber, password, serviceItemId } =
    req.body;
  const clientId = req.user.userId;
  if (!req.user.role) {
    throw new UnauthorizedError('Unauthorized to access this route');
  }
  const { id: commissionerId } = req.params;
  const commissioner = await prisma.commissioner.findFirst({
    where: { id: parseInt(commissionerId) },
  });
  if (!commissioner) {
    throw new NotFoundError(`No commissioners Found!`);
  }

  const updateData = {};
  if (name) {
    updateData.name = name;
  }
  if (identityNumber) {
    updateData.identityNumber = identityNumber;
  }
  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }
  if (serviceItemId) {
    updateData.serviceItemId = parseInt(serviceItemId);
  }
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updateCommissioner = await prisma.commissioner.update({
    where: { id: parseInt(commissionerId) },
    data: updateData,
  });
  res.status(StatusCodes.OK).json({ updateCommissioner });
};
