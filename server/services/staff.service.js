import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatStaff, toEnum } from '../utils/formatters.js';

// Fields needed by formatStaff — excludes base64 `photo` for list queries
const STAFF_LIST_SELECT = {
  id: true, name: true, email: true, phone: true, role: true,
  hireDate: true, status: true, address: true, emergencyContact: true,
  notes: true, restaurantId: true, createdAt: true, updatedAt: true,
};

export const getAll = async (restaurantId, query = {}) => {
  const where = { restaurantId };
  if (query.status) where.status = toEnum(query.status);

  const staff = await prisma.staff.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: STAFF_LIST_SELECT,
  });

  return staff.map(formatStaff);
};

export const getById = async (restaurantId, id) => {
  const member = await prisma.staff.findFirst({
    where: { id, restaurantId },
  });
  if (!member) throw new NotFoundError('Staff member');
  return formatStaff(member);
};

export const create = async (restaurantId, data) => {
  const { status, hireDate, ...rest } = data;
  const member = await prisma.staff.create({
    data: {
      ...rest,
      restaurantId,
      status: toEnum(status || 'active'),
      hireDate: hireDate ? new Date(hireDate) : null,
    },
  });
  return formatStaff(member);
};

export const update = async (restaurantId, id, data) => {
  const existing = await prisma.staff.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Staff member');

  const updateData = { ...data };
  if (data.status) updateData.status = toEnum(data.status);
  if (data.hireDate) updateData.hireDate = new Date(data.hireDate);

  const member = await prisma.staff.update({
    where: { id },
    data: updateData,
  });
  return formatStaff(member);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.staff.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Staff member');
  await prisma.staff.delete({ where: { id } });
};
