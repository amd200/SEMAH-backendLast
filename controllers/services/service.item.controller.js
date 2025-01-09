import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import NotFoundError from '../../errors/not-found.js';

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

  res.status(StatusCodes.CREATED).json(serviceItem);
};

export const getAllServiceItems = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 with 10 items per page
  const skip = (page - 1) * limit;

  const serviceItems = await prisma.serviceItem.findMany({
    skip: parseInt(skip, 10),
    take: parseInt(limit, 10),
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

  const totalCount = await prisma.serviceItem.count(); // Get total count for pagination
  res.status(StatusCodes.OK).json({
    serviceItems,
    totalCount,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCount / limit),
  });
};

export const getServiceItemById = async (req, res) => {
  const { id: serviceItemId } = req.params;
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

  // Validate input
  if (!name && !price && !stages && !duration && !activity && !serviceId) {
    throw new BadRequestError('No fields provided for update');
  }

  // Fetch the existing ServiceItem
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
    if (employeeIds.length > 0) {
      const employees = await prisma.employee.findMany({
        where: {
          id: { in: employeeIds },
        },
      });

      if (employees.length !== employeeIds.length) {
        throw new NotFoundError('Some employees not found');
      }

      employeeConnections = employeeIds.map((id) => ({ id }));
    } else {
      // If employeeIds is an empty array, clear the employees connection
      employeeConnections = [];
    }
  }

  // Prepare connections for clients if provided
  let clientConnections = undefined;
  if (clientIds) {
    if (clientIds.length > 0) {
      const clients = await prisma.client.findMany({
        where: {
          id: { in: clientIds },
        },
      });

      if (clients.length !== clientIds.length) {
        throw new NotFoundError('Some clients not found');
      }

      clientConnections = clientIds.map((id) => ({ id }));
    } else {
      // If clientIds is an empty array, clear the clients connection
      clientConnections = [];
    }
  }

  // Update the ServiceItem
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

  res
    .status(StatusCodes.OK)
    .json({ message: 'ServiceItem deleted successfully' });
};
