import { prisma } from '../config/database.js';

// Matches the staff-call retention already in use, so the feed and the calls
// behind it disappear together rather than leaving orphaned entries.
const RETENTION_DAYS = 30;

const cutoff = () => new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

export const pruneOld = async (restaurantId) => {
  await prisma.notification.deleteMany({
    where: { restaurantId, createdAt: { lt: cutoff() } },
  });
};

/**
 * Record a feed entry. Never throws: a notification failing must not take down
 * the order or bill that triggered it.
 */
export const record = async ({ restaurantId, type, title, body = null, refId = null }) => {
  try {
    return await prisma.notification.create({
      data: { restaurantId, type, title, body, refId },
    });
  } catch (err) {
    console.error('notification record failed:', err.message);
    return null;
  }
};

export const getAll = async (restaurantId, { type } = {}) => {
  await pruneOld(restaurantId);
  return prisma.notification.findMany({
    where: { restaurantId, ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
};

export const markRead = async (restaurantId, id) => {
  const result = await prisma.notification.updateMany({
    where: { id, restaurantId },
    data: { read: true },
  });
  return { updated: result.count };
};

export const markAllRead = async (restaurantId) => {
  const result = await prisma.notification.updateMany({
    where: { restaurantId, read: false },
    data: { read: true },
  });
  return { updated: result.count };
};

export const clearAll = async (restaurantId) => {
  const result = await prisma.notification.deleteMany({ where: { restaurantId } });
  return { deleted: result.count };
};
