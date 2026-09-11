import { prisma } from '../config/database.js';
import { AppError } from '../errors/AppError.js';

// A hard cap keeps the public menu's banner rotation sane and bounds the
// payload — every photo URL is sent to every customer who opens the menu.
export const MAX_PHOTOS = 10;

export const getAll = async (restaurantId) => {
  return prisma.restaurantPhoto.findMany({
    where: { restaurantId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
};

export const create = async (restaurantId, { url, caption }) => {
  const count = await prisma.restaurantPhoto.count({ where: { restaurantId } });
  if (count >= MAX_PHOTOS) {
    throw new AppError(`You can have at most ${MAX_PHOTOS} photos. Remove one first.`, 400);
  }
  const max = await prisma.restaurantPhoto.aggregate({
    where: { restaurantId },
    _max: { sortOrder: true },
  });
  return prisma.restaurantPhoto.create({
    data: {
      restaurantId,
      url,
      caption: caption?.trim() || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
};

export const update = async (restaurantId, id, { caption }) => {
  const existing = await prisma.restaurantPhoto.findFirst({ where: { id, restaurantId } });
  if (!existing) throw new AppError('Photo not found', 404);
  return prisma.restaurantPhoto.update({
    where: { id },
    data: { caption: caption?.trim() || null },
  });
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.restaurantPhoto.findFirst({ where: { id, restaurantId } });
  if (!existing) throw new AppError('Photo not found', 404);
  await prisma.restaurantPhoto.delete({ where: { id } });
};

export const reorder = async (restaurantId, orderedIds) => {
  // Only reorder ids that actually belong to this restaurant — a caller cannot
  // touch another tenant's rows by smuggling their ids into the list.
  const owned = await prisma.restaurantPhoto.findMany({
    where: { id: { in: orderedIds }, restaurantId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));
  const updates = orderedIds
    .filter((id) => ownedIds.has(id))
    .map((id, index) => prisma.restaurantPhoto.update({ where: { id }, data: { sortOrder: index } }));
  return prisma.$transaction(updates);
};
