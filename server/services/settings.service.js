import { prisma } from '../config/database.js';
import { formatSettings } from '../utils/formatters.js';
import { hashPassword } from '../utils/password.js';

export const get = async (restaurantId) => {
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
  });
  return settings ? formatSettings(settings) : null;
};

export const upsert = async (restaurantId, data) => {
  // Hash kitchen PIN before storing
  if (data.kitchenPin) {
    data = { ...data, kitchenPin: await hashPassword(data.kitchenPin) };
  }

  const settings = await prisma.settings.upsert({
    where: { restaurantId },
    create: { ...data, restaurantId },
    update: data,
  });
  return formatSettings(settings);
};
