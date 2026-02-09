import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatOrder, toEnum } from '../utils/formatters.js';

export const getAll = async (restaurantId, query = {}) => {
  const where = { restaurantId };
  if (query.status) where.status = toEnum(query.status);

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(formatOrder);
};

export const getById = async (restaurantId, id) => {
  const order = await prisma.order.findFirst({
    where: { id, restaurantId },
  });
  if (!order) throw new NotFoundError('Order');
  return formatOrder(order);
};

export const getByCustomer = async (restaurantId, customerName, customerMobile) => {
  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      customerName: { equals: customerName, mode: 'insensitive' },
      customerMobile: customerMobile,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return orders.map(formatOrder);
};

export const create = async (restaurantId, data) => {
  const { status, ...rest } = data;
  const order = await prisma.order.create({
    data: {
      ...rest,
      restaurantId,
      status: toEnum(status || 'pending'),
    },
  });
  return formatOrder(order);
};

export const update = async (restaurantId, id, data) => {
  const existing = await prisma.order.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Order');

  const updateData = { ...data };
  if (data.status) updateData.status = toEnum(data.status);

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  });
  return formatOrder(order);
};

export const updateStatus = async (restaurantId, id, status) => {
  const existing = await prisma.order.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Order');

  const order = await prisma.order.update({
    where: { id },
    data: { status: toEnum(status) },
  });
  return formatOrder(order);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.order.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Order');
  await prisma.order.delete({ where: { id } });
};
