import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatTable } from '../utils/formatters.js';

export const getAll = async (restaurantId) => {
  const tables = await prisma.table.findMany({
    where: { restaurantId },
    orderBy: { number: 'asc' },
  });
  return tables.map(formatTable);
};

export const getById = async (restaurantId, id) => {
  const table = await prisma.table.findFirst({
    where: { id, restaurantId },
  });
  if (!table) throw new NotFoundError('Table');
  return formatTable(table);
};

export const create = async (restaurantId, data) => {
  const table = await prisma.table.create({
    data: { ...data, restaurantId },
  });
  return formatTable(table);
};

export const update = async (restaurantId, id, data) => {
  const existing = await prisma.table.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Table');

  const table = await prisma.table.update({
    where: { id },
    data,
  });
  return formatTable(table);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.table.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Table');
  await prisma.table.delete({ where: { id } });
};
