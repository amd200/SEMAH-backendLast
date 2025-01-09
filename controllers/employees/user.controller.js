import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const getAllEmployees = async (req, res) => {
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      identityNumber: true,
      dob: true,
      phoneNumber: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.status(StatusCodes.OK).json(employees);
};

export const getEmployeeById = async (req, res) => {
  const { id: employeeId } = req.params;
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      identityNumber: true,
      dob: true,
      phoneNumber: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }
  res.status(StatusCodes.OK).json(employee);
};

export const updateEmployee = async (req, res) => {
  const { id: employeeId } = req.params;
  const { name, email, identityNumber, dob, phoneNumber } = req.body;
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  });
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }
  const updatedEmployee = await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      name,
      email,
      identityNumber,
      dob,
      phoneNumber,
    },
    select: {
      id: true,
      name: true,
      email: true,
      identityNumber: true,
      dob: true,
      phoneNumber: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.status(StatusCodes.OK).json(updatedEmployee);
};

export const deleteEmployee = async (req, res) => {
  const { id: employeeId } = req.params;
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  });
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }
  const deleteEmployee = await prisma.employee.delete({
    where: {
      id: employeeId,
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Employee deleted successfully' });
};

export const showCurrentEmployee = async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      identityNumber: true,
      dob: true,
      phoneNumber: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }
  res.status(StatusCodes.OK).json(employee);
};
