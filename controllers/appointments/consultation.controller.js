import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

export const createConsultation = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError('Please provide a valid consultation name!');
  }
  const consultation = await prisma.consultation.create({
    data: { name },
  });
  res.status(StatusCodes.CREATED).json({ consultation });
};

export const getAllConsultations = async (req, res) => {
  const consultations = await prisma.consultation.findMany({});
  res.status(StatusCodes.OK).json({ consultations });
};

export const getConsultationById = async (req, res) => {
  const { id: consultationId } = req.params;
  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(consultationId) },
  });
  if (!consultation) {
    throw new NotFoundError('No Consultation Found with this id');
  }
  res.status(StatusCodes.OK).json({ consultation });
};

export const updateConsultation = async (req, res) => {
  const { name } = req.body;
  const { id: consultationId } = req.params;
  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(consultationId) },
  });
  if (!consultation) {
    throw new NotFoundError('No Consultation Found with this id');
  }
  const updateConsultation = await prisma.consultation.update({
    where: { id: parseInt(consultationId) },
    data: { name },
  });
  res.status(StatusCodes.OK).json({ updateConsultation });
};

export const deleteConsultation = async (req, res) => {
  const { id: consultationId } = req.params;
  const consultation = await prisma.consultation.findUnique({
    where: { id: parseInt(consultationId) },
  });
  if (!consultation) {
    throw new NotFoundError('No Consultation Found with this id');
  }
  const deleteConsultation = await prisma.consultation.delete({
    where: { id: parseInt(consultationId) },
  });
  res.status(StatusCodes.OK).json({ msg: 'Consultation has been deleted!' });
};
