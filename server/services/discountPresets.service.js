import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/index.js';
import { formatDiscountPreset } from '../utils/formatters.js';

export const getAll = async (restaurantId) => {
  const presets = await prisma.discountPreset.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
  });
  return presets.map(formatDiscountPreset);
};

export const getActive = async (restaurantId) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 6=Sat
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const presets = await prisma.discountPreset.findMany({
    where: {
      restaurantId,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter by schedule constraints in application code
  const filtered = presets.filter(preset => {
    // Check end date
    if (preset.endDate && preset.endDate < now) return false;

    // Check active days
    if (preset.activeDays.length > 0 && !preset.activeDays.includes(currentDay)) return false;

    // Check time window
    if (preset.startTime && currentTime < preset.startTime) return false;
    if (preset.endTime && currentTime > preset.endTime) return false;

    return true;
  });

  return filtered.map(formatDiscountPreset);
};

export const getById = async (restaurantId, id) => {
  const preset = await prisma.discountPreset.findFirst({
    where: { id, restaurantId },
  });
  if (!preset) throw new NotFoundError('Discount preset');
  return formatDiscountPreset(preset);
};

export const create = async (restaurantId, data) => {
  const { startDate, endDate, ...rest } = data;
  const preset = await prisma.discountPreset.create({
    data: {
      ...rest,
      restaurantId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  return formatDiscountPreset(preset);
};

export const update = async (restaurantId, id, data) => {
  const existing = await prisma.discountPreset.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Discount preset');

  const updateData = { ...data };
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

  const preset = await prisma.discountPreset.update({
    where: { id },
    data: updateData,
  });
  return formatDiscountPreset(preset);
};

export const remove = async (restaurantId, id) => {
  const existing = await prisma.discountPreset.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Discount preset');
  await prisma.discountPreset.delete({ where: { id } });
};
