import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatMenuItem, toEnum } from '../utils/formatters.js';

export const getAll = async (restaurantId, query = {}) => {
  const where = { restaurantId };
  if (query.category) where.category = query.category;
  if (query.available !== undefined) where.available = query.available === 'true';

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return items.map(formatMenuItem);
};

export const getById = async (restaurantId, id) => {
  const item = await prisma.menuItem.findFirst({
    where: { id, restaurantId },
  });
  if (!item) throw new NotFoundError('Menu item');
  return formatMenuItem(item);
};

export const getCategories = async (restaurantId) => {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return items.map((i) => i.category).filter(Boolean);
};

export const create = async (restaurantId, data) => {
  const { dietary, ...rest } = data;

  const item = await prisma.menuItem.create({
    data: {
      ...rest,
      restaurantId,
      dietaryType: toEnum(dietary?.type || 'veg'),
      spiceLevel: dietary?.spiceLevel ?? 0,
      allergens: dietary?.allergens || [],
      labels: dietary?.labels || [],
    },
  });

  return formatMenuItem(item);
};

export const update = async (restaurantId, id, data) => {
  const existing = await prisma.menuItem.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Menu item');

  const { dietary, ...rest } = data;
  const updateData = { ...rest };

  if (dietary) {
    if (dietary.type !== undefined) updateData.dietaryType = toEnum(dietary.type);
    if (dietary.spiceLevel !== undefined) updateData.spiceLevel = dietary.spiceLevel;
    if (dietary.allergens !== undefined) updateData.allergens = dietary.allergens;
    if (dietary.labels !== undefined) updateData.labels = dietary.labels;
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: updateData,
  });

  return formatMenuItem(item);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.menuItem.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Menu item');

  await prisma.menuItem.delete({ where: { id } });
};
