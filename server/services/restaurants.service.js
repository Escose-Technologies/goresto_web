import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../errors/index.js';
import { formatRestaurant } from '../utils/formatters.js';
import { revokeAllUserTokens } from '../utils/jwt.js';
import { emitRestaurantSuspended, emitRestaurantReactivated } from '../utils/socketEmitter.js';

// Excludes large base64 columns from list/summary queries
const RESTAURANT_LIST_SELECT = {
  id: true, name: true, tagline: true, description: true, address: true,
  phone: true, email: true, website: true, cuisineTypes: true,
  foodType: true, socialLinks: true, openingHours: true,
  discount: true, qrCode: true, adminId: true, status: true,
  suspendedAt: true, createdAt: true, updatedAt: true,
  _count: { select: { menuItems: true, orders: true, staff: true, tables: true } },
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

// Superadmin-only operational suspend/reactivate. Only toggles between
// active <-> suspended; does not touch the registration lifecycle states.
export const setStatus = async (id, target) => {
  const existing = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, status: true, adminId: true },
  });
  if (!existing) throw new NotFoundError('Restaurant');

  if (target === 'suspended') {
    if (existing.status !== 'active') {
      throw new ConflictError(`Only active restaurants can be deactivated (current: ${existing.status})`);
    }
  } else if (target === 'active') {
    if (existing.status !== 'suspended') {
      throw new ConflictError(`Only suspended restaurants can be reactivated (current: ${existing.status})`);
    }
  } else {
    throw new ConflictError('Invalid status transition');
  }

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { status: target, suspendedAt: target === 'suspended' ? new Date() : null },
  });

  if (target === 'suspended') {
    // Immediately kill the refresh path for all admins of this restaurant
    const adminConditions = [{ restaurantId: id }];
    if (existing.adminId) adminConditions.push({ id: existing.adminId });
    const admins = await prisma.user.findMany({
      where: { OR: adminConditions, role: 'restaurant_admin' },
      select: { id: true },
    });
    await Promise.all(admins.map((u) => revokeAllUserTokens(u.id)));
    emitRestaurantSuspended(id);
  } else {
    emitRestaurantReactivated(id);
  }

  return formatRestaurant(restaurant);
};

export const remove = async (id) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Restaurant');
  await prisma.restaurant.delete({ where: { id } });
};

/**
 * Update a restaurant's identity in one transaction.
 *
 * Identity lives in two places for historical reasons: the public menu reads
 * settings.address / settings.phone / settings.openingTime, while bills and the
 * profile header read the Restaurant row. Writing them separately let the two
 * drift — production already had restaurants whose Settings.email was empty
 * while Restaurant.email was set.
 *
 * Profile is now the only writer, and both rows move together or not at all.
 */
export const updateProfile = async (id, data) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Restaurant');

  const { openingTime, closingTime, ...restaurantData } = data;

  const [restaurant] = await prisma.$transaction([
    prisma.restaurant.update({ where: { id }, data: restaurantData }),
    prisma.settings.upsert({
      where: { restaurantId: id },
      create: {
        restaurantId: id,
        restaurantName: restaurantData.name,
        address: restaurantData.address ?? null,
        phone: restaurantData.phone ?? null,
        email: restaurantData.email ?? null,
        ...(openingTime ? { openingTime } : {}),
        ...(closingTime ? { closingTime } : {}),
      },
      update: {
        restaurantName: restaurantData.name,
        address: restaurantData.address ?? null,
        phone: restaurantData.phone ?? null,
        email: restaurantData.email ?? null,
        ...(openingTime ? { openingTime } : {}),
        ...(closingTime ? { closingTime } : {}),
      },
    }),
  ]);

  return formatRestaurant(restaurant);
};
