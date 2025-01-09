import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import checkPermission from '../../utils/checkPermissions.js';

export const createCompany = async (req, res) => {
  const {
    name,
    commercialNumber,
    taxNumber,
    address,
    owner,
    ownerEmail,
    ownerPhoneNumber,
  } = req.body;
  if (
    !name ||
    !commercialNumber ||
    !taxNumber ||
    !address ||
    !owner ||
    !ownerEmail ||
    !ownerPhoneNumber
  ) {
    throw new BadRequestError('All fields are required');
  }

  const clientId = req.user.userId;

  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }

  const company = await prisma.company.create({
    data: {
      name,
      commercialNumber,
      taxNumber,
      address,
      owner,
      ownerEmail,
      ownerPhoneNumber,
      clientId: clientId,
    },
  });
  res.status(StatusCodes.CREATED).json({ company });
};

export const getAllCompanies = async (req, res) => {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      commercialNumber: true,
      taxNumber: true,
      address: true,
      owner: true,
      ownerEmail: true,
      ownerPhoneNumber: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json(companies);
};

export const getCompanyById = async (req, res) => {
  const { id: companyId } = req.params;
  const company = await prisma.company.findUnique({
    where: {
      id: parseInt(companyId, 10),
    },
    select: {
      id: true,
      name: true,
      commercialNumber: true,
      taxNumber: true,
      address: true,
      owner: true,
      ownerEmail: true,
      ownerPhoneNumber: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  res.status(StatusCodes.OK).json(company);
};

export const updateCompany = async (req, res) => {
  const { id: companyId } = req.params;
  const {
    name,
    commercialNumber,
    taxNumber,
    address,
    owner,
    ownerEmail,
    ownerPhoneNumber,
  } = req.body;

  const company = await prisma.company.findUnique({
    where: {
      id: parseInt(companyId, 10),
    },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  checkPermission(req.user, company.clientId);

  const updatedCompany = await prisma.company.update({
    where: {
      id: parseInt(companyId, 10),
    },
    data: {
      name,
      commercialNumber,
      taxNumber,
      address,
      owner,
      ownerEmail,
      ownerPhoneNumber,
    },
  });
  res.status(StatusCodes.OK).json(updatedCompany);
};

export const deleteCompany = async (req, res) => {
  const { id: companyId } = req.params;
  const company = await prisma.company.findUnique({
    where: {
      id: parseInt(companyId, 10),
    },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  checkPermission(req.user, company.clientId);

  const deleteCompany = await prisma.company.delete({
    where: {
      id: parseInt(companyId, 10),
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Company deleted successfully' });
};
