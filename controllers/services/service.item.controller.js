import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';
import { getCache, setCache, clearCache } from '../../utils/redisCaching.js';

export const createServiceItem = async (req, res) => {
  const {
    name,
    price,
    stages,
    duration,
    activity,
    serviceId,
    employeeIds,
    clientIds,
  } = req.body;

  // Validation
  if (!name || !price || !stages || !duration || !activity || !serviceId) {
    throw new BadRequestError('All fields are required');
  }

  const service = await prisma.service.findUnique({
    where: {
      id: parseInt(serviceId, 10),
    },
  });
  if (!service) {
    throw new NotFoundError('Service not found');
  }

  // Validate and prepare connections for employees
  let employeeConnections = [];
  if (employeeIds && employeeIds.length > 0) {
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
      },
    });

    if (employees.length !== employeeIds.length) {
      throw new NotFoundError('Some employees not found');
    }

    employeeConnections = employeeIds.map((id) => ({ id }));
  }

  // Validate and prepare connections for clients
  let clientConnections = [];
  if (clientIds && clientIds.length > 0) {
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
      },
    });

    if (clients.length !== clientIds.length) {
      throw new NotFoundError('Some clients not found');
    }

    clientConnections = clientIds.map((id) => ({ id }));
  }

  // Create ServiceItem
  const serviceItem = await prisma.serviceItem.create({
    data: {
      name,
      price,
      stages,
      duration,
      activity,
      service: { connect: { id: parseInt(serviceId, 10) } },
      employees: { connect: employeeConnections },
      clients: { connect: clientConnections },
    },

    include: {
      employees: { select: { name: true } },
      clients: {
        select: {
          name: true,
        },
      },
    },
  });
  await clearCache('services:list');
  await clearCache('serviceItems:list');
  await clearCache(`serviceItem:${serviceId}`);
  await clearCache(`service:${serviceId}`);

  res.status(StatusCodes.CREATED).json(serviceItem);
};

export const getAllServiceItems = async (req, res) => {
  const cacheKey = 'serviceItems:list';
  const cachedServiceItems = await getCache(cacheKey);
  if (cachedServiceItems) {
    return res
      .status(StatusCodes.OK)
      .json({ serviceItems: cachedServiceItems });
  }

  const serviceItems = await prisma.serviceItem.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      stages: true,
      duration: true,
      activity: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      employees: {
        select: {
          id: true,
          name: true,
        },
      },
      clients: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  await setCache(cacheKey, serviceItems, 3600);

  res.status(StatusCodes.OK).json({
    serviceItems,
  });
};

export const getServiceItemById = async (req, res) => {
  const { id: serviceItemId } = req.params;
  const cacheKey = `serviceItem:${serviceItemId}`;
  const cachedServiceItem = await getCache(cacheKey);
  if (cachedServiceItem) {
    return res.status(StatusCodes.OK).json({ serviceItem: cachedServiceItem });
  }
  const serviceItem = await prisma.serviceItem.findUnique({
    where: {
      id: parseInt(serviceItemId, 10),
    },
    include: {
      employees: { select: { name: true } },
      clients: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!serviceItem) {
    throw new NotFoundError('ServiceItem not found');
  }
  await setCache(cacheKey, serviceItem, 3600);
  res.status(StatusCodes.OK).json(serviceItem);
};

export const updateServiceItem = async (req, res) => {
  const { id: serviceItemId } = req.params;
  const {
    name,
    price,
    stages,
    duration,
    activity,
    serviceId,
    employeeIds,
    clientIds,
  } = req.body;

  if (!name && !price && !stages && !duration && !activity && !serviceId) {
    throw new BadRequestError('No fields provided for update');
  }

  const existingServiceItem = await prisma.serviceItem.findUnique({
    where: {
      id: parseInt(serviceItemId, 10),
    },
  });
  if (!existingServiceItem) {
    throw new NotFoundError('ServiceItem not found');
  }

  let employeeConnections = undefined;
  if (employeeIds) {
    employeeConnections =
      employeeIds.length > 0 ? employeeIds.map((id) => ({ id })) : [];
  }

  let clientConnections = undefined;
  if (clientIds) {
    clientConnections =
      clientIds.length > 0 ? clientIds.map((id) => ({ id })) : [];
  }

  const updatedServiceItem = await prisma.serviceItem.update({
    where: {
      id: parseInt(serviceItemId, 10),
    },
    data: {
      name,
      price,
      stages,
      duration,
      activity,
      service: serviceId
        ? { connect: { id: parseInt(serviceId, 10) } }
        : undefined,
      employees: { set: employeeConnections },
      clients: { set: clientConnections },
    },
    include: {
      employees: { select: { name: true } },
      clients: {
        select: {
          name: true,
        },
      },
    },
  });

  // Clear related caches
  await clearCache(`serviceItem:${serviceItemId}`);
  if (existingServiceItem.serviceId) {
    await clearCache(`service:${existingServiceItem.serviceId}`);
  }
  if (serviceId) {
    await clearCache(`service:${serviceId}`);
  }
  await clearCache('services:list');
  await clearCache('serviceItems:list');

  res.status(StatusCodes.OK).json(updatedServiceItem);
};
export const deleteServiceItem = async (req, res) => {
  const { id: serviceItemId } = req.params;

  const serviceItem = await prisma.serviceItem.findUnique({
    where: {
      id: parseInt(serviceItemId, 10),
    },
  });
  if (!serviceItem) {
    throw new NotFoundError('ServiceItem not found');
  }

  await prisma.serviceItem.delete({
    where: {
      id: parseInt(serviceItemId, 10),
    },
  });

  await clearCache(`serviceItem:${serviceItemId}`);
  if (serviceItem.serviceId) {
    await clearCache(`service:${serviceItem.serviceId}`);
  }
  await clearCache('services:list');
  await clearCache('serviceItems:list');

  res
    .status(StatusCodes.OK)
    .json({ message: 'ServiceItem deleted successfully' });
};
