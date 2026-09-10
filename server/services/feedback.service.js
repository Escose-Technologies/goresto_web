import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';

export const create = async ({ restaurantId, userId, userEmail, data }) => {
  const { consentGiven, diagnostics, ...rest } = data;
  return prisma.feedback.create({
    data: {
      ...rest,
      restaurantId,
      userId: userId || null,
      userEmail: userEmail || null,
      // Strict identity, not truthiness: the validator already rejects
      // non-booleans, but consent is the one field worth double-guarding.
      consentGiven: consentGiven === true,
      // Diagnostics are stored only when consent was given, regardless of what
      // the client sent — the server is the last line, not the checkbox.
      diagnostics: consentGiven === true ? (diagnostics ?? null) : null,
    },
  });
};

export const listForRestaurant = async (restaurantId) =>
  prisma.feedback.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, rating: true, category: true, title: true, details: true,
      status: true, adminNotes: true, createdAt: true,
    },
  });

export const listAll = async ({ status, category, restaurantId, rating, from, to, q } = {}) => {
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(restaurantId ? { restaurantId } : {}),
    ...(rating ? { rating } : {}),
  };

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { details: { contains: term, mode: 'insensitive' } },
      { userEmail: { contains: term, mode: 'insensitive' } },
      { restaurant: { name: { contains: term, mode: 'insensitive' } } },
    ];
  }

  return prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { restaurant: { select: { id: true, name: true } } },
  });
};

export const update = async (id, data) => {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Feedback');
  return prisma.feedback.update({ where: { id }, data });
};
