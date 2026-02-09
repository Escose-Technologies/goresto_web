import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { NotFoundError, ConflictError } from '../errors/index.js';
import { formatUser } from '../utils/formatters.js';

export const getAll = async (query = {}) => {
  const { role, email } = query;
  const where = {};
  if (role) where.role = role;
  if (email) where.email = email;

  const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
  return users.map(formatUser);
};

export const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');
  return formatUser(user);
};

export const create = async (data) => {
  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
  return formatUser(user);
};

export const update = async (id, data) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('User');

  const updateData = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({ where: { id }, data: updateData });
  return formatUser(user);
};

export const remove = async (id) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('User');
  await prisma.user.delete({ where: { id } });
};
