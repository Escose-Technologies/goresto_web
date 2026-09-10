import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { formatSettings } from '../utils/formatters.js';

export const get = async (restaurantId) => {
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
  });
  if (!settings) return null;

  // The PIN is a bcrypt hash and no client has any use for it. Send a flag so
  // the UI can say whether one is set, and nothing more. Leaking the hash also
  // broke the Settings form, which pre-filled the field with it and then failed
  // its own 4-digit validation on every save.
  const { kitchenPin, ...rest } = settings;
  return { ...formatSettings(rest), kitchenPinSet: Boolean(kitchenPin) };
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
