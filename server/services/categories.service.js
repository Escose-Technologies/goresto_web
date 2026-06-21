import { prisma } from '../config/database.js';

export const getAll = async (restaurantId) => {
  return prisma.category.findMany({
    where: { restaurantId },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
};

export const create = async (restaurantId, data) => {
  const maxOrder = await prisma.category.aggregate({
    where: { restaurantId },
    _max: { displayOrder: true },
  });
  return prisma.category.create({
    data: {
      restaurantId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
    },
  });
};

export const update = async (restaurantId, id, data) => {
  return prisma.category.update({
    where: { id, restaurantId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
    },
  });
};

export const remove = async (restaurantId, id) => {
  return prisma.category.delete({ where: { id, restaurantId } });
};

export const reorder = async (restaurantId, orderedIds) => {
  const updates = orderedIds.map((id, index) =>
    prisma.category.update({ where: { id, restaurantId }, data: { displayOrder: index } })
  );
  return prisma.$transaction(updates);
};
