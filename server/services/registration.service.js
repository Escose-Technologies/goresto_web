import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { formatRestaurant } from '../utils/formatters.js';
import { DEFAULT_CATEGORIES } from '../config/defaultCategories.js';

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

    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat, i) => ({
        restaurantId: restaurant.id,
        name: cat.name,
        description: cat.description,
        displayOrder: i,
      })),
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
  if (restaurants.length === 0) return [];

  // Soft duplicate detection: flag pending applications whose phone or email
  // already belongs to another restaurant, so the reviewer can spot an
  // accidental re-registration. Deliberately NOT a unique constraint —
  // a chain legitimately shares one contact number across branches — so this
  // informs the decision rather than blocking it.
  const phones = restaurants.map((r) => r.phone).filter(Boolean);
  const emails = restaurants.map((r) => r.email).filter(Boolean);
  const pendingIds = new Set(restaurants.map((r) => r.id));

  const matches = (phones.length || emails.length)
    ? await prisma.restaurant.findMany({
        where: {
          OR: [
            ...(phones.length ? [{ phone: { in: phones } }] : []),
            ...(emails.length ? [{ email: { in: emails } }] : []),
          ],
        },
        select: { id: true, name: true, phone: true, email: true, status: true },
      })
    : [];

  return restaurants.map((r) => {
    const others = matches.filter((m) => m.id !== r.id && !pendingIds.has(m.id));
    const duplicates = {
      phone: r.phone ? others.filter((m) => m.phone === r.phone).map((m) => m.name) : [],
      email: r.email ? others.filter((m) => m.email === r.email).map((m) => m.name) : [],
    };
    return {
      ...formatRestaurant(r),
      duplicates:
        duplicates.phone.length || duplicates.email.length ? duplicates : null,
    };
  });
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
