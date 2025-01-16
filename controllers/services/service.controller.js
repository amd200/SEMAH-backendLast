import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import { getCache, setCache, clearCache } from '../../utils/redisCaching.js';
import cloudinary from '../../configs/cloudinaryConfig.js';
import fs from 'fs';

export const createService = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError('Service Name is required');
  }
  let picture = '/uploads/default-product.jpeg';
  if (req.files && req.files.picture) {
    const result = await cloudinary.uploader.upload(
      req.files.picture.tempFilePath,
      {
        use_filename: true,
        folder: 'product-images',
      }
    );
    fs.unlinkSync(req.files.picture.tempFilePath);
    picture = result.secure_url;
  }

  const service = await prisma.service.create({
    data: {
      name,
      picture,
    },
  });
  await clearCache('services:list');
  res.status(StatusCodes.CREATED).json(service);
};

export const getAllServices = async (req, res) => {
  const cacheKey = 'services:list';
  const cachedServices = await getCache(cacheKey);
  if (cachedServices) {
    return res.status(StatusCodes.OK).json({ services: cachedServices });
  }
  const services = await prisma.service.findMany({});

  await setCache(cacheKey, services, 3600);
  res.status(StatusCodes.OK).json(services);
};

export const getServiceById = async (req, res) => {
  const { id: serviceId } = req.params;
  const cacheKey = `service:${serviceId}`;
  const cachedServices = await getCache(cacheKey);
  if (cachedServices) {
    return res.status(StatusCodes.OK).json({ service: cachedServices });
  }

  const service = await prisma.service.findUnique({
    where: {
      id: parseInt(serviceId, 10),
    },
    include: { services: true },
  });
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  await setCache(cacheKey, service, 3600);
  res.status(StatusCodes.OK).json(service);
};

export const updateService = async (req, res) => {
  const { id: serviceId } = req.params;
  const { name } = req.body;
  const service = await prisma.service.findUnique({
    where: {
      id: parseInt(serviceId, 10),
    },
  });
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  const updatedService = await prisma.service.update({
    where: {
      id: parseInt(serviceId, 10),
    },
    data: {
      name,
    },
  });
  await clearCache(`service:${serviceId}`);
  res.status(StatusCodes.OK).json(updatedService);
};

export const deleteService = async (req, res) => {
  const { id: serviceId } = req.params;
  const service = await prisma.service.findUnique({
    where: {
      id: parseInt(serviceId, 10),
    },
  });
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  const deleteService = await prisma.service.delete({
    where: {
      id: parseInt(serviceId, 10),
    },
  });
  await clearCache(`service:${serviceId}`);
  res.status(StatusCodes.OK).json({ message: 'Service deleted successfully' });
};
