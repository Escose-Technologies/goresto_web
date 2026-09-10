import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { formatSettings } from '../utils/formatters.js';

export const get = async (restaurantId) => {
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
  });
  return settings ? formatSettings(settings) : null;
};

/** bcrypt hashes always start with $2 — used to avoid re-hashing a hash. */
const isHashed = (value) => typeof value === 'string' && value.startsWith('$2');

export const upsert = async (restaurantId, data) => {
  const payload = { ...data };

  // The kitchen PIN is a credential and is stored hashed. The column was
  // widened to 72 chars for exactly this and then never used, so PINs sat in
  // plaintext where anyone with database access could read them.
  if (payload.kitchenPin && !isHashed(payload.kitchenPin)) {
    payload.kitchenPin = await hashPassword(String(payload.kitchenPin));
  }

  const settings = await prisma.settings.upsert({
    where: { restaurantId },
    create: { ...payload, restaurantId },
    update: payload,
  });
  return formatSettings(settings);
};
