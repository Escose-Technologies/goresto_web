import { prisma } from '../config/database.js';
import { formatSettings } from '../utils/formatters.js';

export const get = async (restaurantId) => {
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
  });
  return settings ? formatSettings(settings) : null;
};

export const upsert = async (restaurantId, data) => {
  const settings = await prisma.settings.upsert({
    where: { restaurantId },
    create: { ...data, restaurantId },
    update: data,
  });
  return formatSettings(settings);
};
