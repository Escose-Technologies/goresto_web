#!/usr/bin/env node
/**
 * One-off: hash any kitchen PIN still stored in plaintext.
 *
 * Verification accepts plaintext once and upgrades in place, so this is not
 * strictly required — but that only fires when a kitchen next signs in, which
 * could be never for a restaurant that does not use the KDS. This closes the
 * window immediately.
 *
 * Idempotent: rows already hashed are skipped, so it is safe to re-run.
 *
 *   docker compose -f docker-compose.oci.yml exec app node scripts/hash-kitchen-pins.js
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

const run = async () => {
  const rows = await prisma.settings.findMany({
    where: { kitchenPin: { not: null } },
    select: { id: true, restaurantId: true, kitchenPin: true },
  });

  let hashed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.kitchenPin.startsWith('$2')) {
      skipped += 1;
      continue;
    }
    await prisma.settings.update({
      where: { id: row.id },
      data: { kitchenPin: await bcrypt.hash(row.kitchenPin, ROUNDS) },
    });
    hashed += 1;
    console.log(`hashed PIN for restaurant ${row.restaurantId}`);
  }

  console.log(`\ndone — ${hashed} hashed, ${skipped} already hashed, ${rows.length} total`);
};

run()
  .catch((err) => { console.error('failed:', err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
