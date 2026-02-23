import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatRestaurant } from '../utils/formatters.js';

// Excludes large base64 columns from list/summary queries
const RESTAURANT_LIST_SELECT = {
  id: true, name: true, description: true, address: true,
  phone: true, email: true, website: true, cuisineTypes: true,
  foodType: true, socialLinks: true, openingHours: true,
  discount: true, qrCode: true, adminId: true, status: true,
  createdAt: true, updatedAt: true,
  // logo, coverImage: EXCLUDED — fetch via getById when needed
};

export const getAll = async () => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
    select: RESTAURANT_LIST_SELECT,
  });
  return restaurants.map(formatRestaurant);
};

export const getById = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new NotFoundError('Restaurant');
  return formatRestaurant(restaurant);
};

export const getByUser = async (user) => {
  // Single query with OR instead of 2 sequential queries
  const conditions = [{ adminId: user.id }];
  if (user.restaurantId) conditions.unshift({ id: user.restaurantId });

  const restaurant = await prisma.restaurant.findFirst({
    where: { OR: conditions },
  });

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
