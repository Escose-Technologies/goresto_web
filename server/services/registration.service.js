import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { formatRestaurant } from '../utils/formatters.js';

export const register = async (data) => {
  const { ownerName, email, password, phone, restaurantName, address, cuisineTypes, foodType } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'restaurant_admin',
      },
    });

    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        address,
        phone,
        email,
        description: `Owner: ${ownerName}`,
        cuisineTypes,
        foodType,
        status: 'pending',
        adminId: user.id,
        qrCode: '',
      },
    });

    await tx.restaurant.update({
      where: { id: restaurant.id },
      data: { qrCode: `/menu/${restaurant.id}` },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { restaurantId: restaurant.id },
    });

    return { restaurantId: restaurant.id };
  });

  return result;
};

export const getPendingRegistrations = async () => {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, description: true, address: true,
      phone: true, email: true, cuisineTypes: true, foodType: true,
      status: true, createdAt: true, updatedAt: true,
      admin: { select: { id: true, email: true } },
    },
  });
  return restaurants.map(formatRestaurant);
};

export const approveRegistration = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new NotFoundError('Restaurant');
  if (restaurant.status !== 'pending') {
    throw new ConflictError(`Restaurant is already ${restaurant.status}`);
  }

  const updated = await prisma.restaurant.update({
    where: { id },
    data: { status: 'active' },
  });
  return formatRestaurant(updated);
};

export const rejectRegistration = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new NotFoundError('Restaurant');
  if (restaurant.status !== 'pending') {
    throw new ConflictError(`Restaurant is already ${restaurant.status}`);
  }

  const updated = await prisma.restaurant.update({
    where: { id },
    data: { status: 'rejected' },
  });
  return formatRestaurant(updated);
};
