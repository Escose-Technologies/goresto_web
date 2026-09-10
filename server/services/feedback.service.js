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

export const listAll = async ({ status, category } = {}) =>
  prisma.feedback.findMany({
    where: { ...(status ? { status } : {}), ...(category ? { category } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { restaurant: { select: { id: true, name: true } } },
  });

export const update = async (id, data) => {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Feedback');
  return prisma.feedback.update({ where: { id }, data });
};
