import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatReview } from '../utils/formatters.js';

export const getAll = async (restaurantId, query = {}) => {
  const where = { restaurantId };
  if (query.menuItemId) where.menuItemId = query.menuItemId;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return reviews.map(formatReview);
};

export const getByMenuItem = async (restaurantId, menuItemId) => {
  const reviews = await prisma.review.findMany({
    where: { restaurantId, menuItemId },
    orderBy: { createdAt: 'desc' },
  });
  return reviews.map(formatReview);
};

export const create = async (restaurantId, data) => {
  // Verify menu item exists in this restaurant
  const menuItem = await prisma.menuItem.findFirst({
    where: { id: data.menuItemId, restaurantId },
  });
  if (!menuItem) throw new NotFoundError('Menu item');

  // Create review and update menu item rating in a transaction
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: { ...data, restaurantId },
    });

    // Recalculate rating
    const agg = await tx.review.aggregate({
      where: { menuItemId: data.menuItemId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.menuItem.update({
      where: { id: data.menuItemId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewCount: agg._count.rating || 0,
      },
    });

    return newReview;
  });

  return formatReview(review);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.review.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Review');

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });

    // Recalculate rating
    const agg = await tx.review.aggregate({
      where: { menuItemId: existing.menuItemId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.menuItem.update({
      where: { id: existing.menuItemId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewCount: agg._count.rating || 0,
      },
    });
  });
};
