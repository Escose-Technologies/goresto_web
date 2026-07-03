import { prisma } from '../config/database.js';

const RETENTION_DAYS = 30;

// Best-effort prune of calls older than the retention window.
const pruneOld = async (restaurantId) => {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  try {
    await prisma.staffCall.deleteMany({
      where: { restaurantId, createdAt: { lt: cutoff } },
    });
  } catch {
    /* pruning is non-critical */
  }
};

export const create = async (restaurantId, { tableNumber, customerName }) => {
  await pruneOld(restaurantId);
  return prisma.staffCall.create({
    data: {
      restaurantId,
      tableNumber: String(tableNumber),
      customerName: customerName?.trim() || null,
    },
  });
};

export const getAll = async (restaurantId) => {
  await pruneOld(restaurantId);
  return prisma.staffCall.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
};

export const markRead = async (restaurantId, id) => {
  return prisma.staffCall.update({
    where: { id, restaurantId },
    data: { read: true },
  });
};

export const markAllRead = async (restaurantId) => {
  await prisma.staffCall.updateMany({
    where: { restaurantId, read: false },
    data: { read: true },
  });
  return { success: true };
};

export const clearAll = async (restaurantId) => {
  await prisma.staffCall.deleteMany({ where: { restaurantId } });
  return { success: true };
};
