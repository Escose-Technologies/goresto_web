import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatRestaurant } from '../utils/formatters.js';

export const getAll = async () => {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { createdAt: 'desc' } });
  return restaurants.map(formatRestaurant);
};

export const getById = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new NotFoundError('Restaurant');
  return formatRestaurant(restaurant);
};

export const getByUser = async (user) => {
  let restaurant = null;

  if (user.restaurantId) {
    restaurant = await prisma.restaurant.findUnique({ where: { id: user.restaurantId } });
  }

  if (!restaurant) {
    restaurant = await prisma.restaurant.findFirst({ where: { adminId: user.id } });
  }

  if (!restaurant) throw new NotFoundError('Restaurant');
  return formatRestaurant(restaurant);
};

export const create = async (data) => {
  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      qrCode: '', // Will be set after creation with the ID
    },
  });

  // Update qrCode with the actual restaurant ID
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { qrCode: `/menu/${restaurant.id}` },
  });

  return formatRestaurant(updated);
};

export const update = async (id, data) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Restaurant');

  const restaurant = await prisma.restaurant.update({ where: { id }, data });
  return formatRestaurant(restaurant);
};

export const remove = async (id) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Restaurant');
  await prisma.restaurant.delete({ where: { id } });
};
