import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const createAppointment = async (req, res) => {
  const { appointmentSubject, consultationId, appointmentType, date } =
    req.body;
  if (!appointmentSubject || !consultationId || !appointmentType || !date) {
    throw new BadRequestError('Please provide all required fields');
  }
  const appointment = await prisma.appointment.create({
    data: {
      appointmentSubject,
      consultationId: parseInt(consultationId),
      appointmentType,
      date: new Date(date).toISOString(),
    },
  });

  res.status(StatusCodes.CREATED).json({ appointment });
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
