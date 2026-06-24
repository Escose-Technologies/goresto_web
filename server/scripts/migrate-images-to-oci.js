#!/usr/bin/env node
/**
 * One-time migration: converts base64 images in MenuItem.image to OCI Object Storage URLs.
 * Run on the server: node server/scripts/migrate-images-to-oci.js
 */
import { PrismaClient } from '@prisma/client';
import { uploadImage } from '../services/ociStorage.service.js';

const prisma = new PrismaClient();

async function migrate() {
  const items = await prisma.menuItem.findMany({
    where: { image: { startsWith: 'data:' } },
    select: { id: true, name: true, image: true },
  });

  console.log(`Found ${items.length} items with base64 images`);

  for (const item of items) {
    try {
      const match = item.image.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!match) { console.log(`  Skipping ${item.name}: unrecognized format`); continue; }

      const contentType = match[1];
      const ext = contentType.split('/')[1].replace(/\+.*/, '') || 'jpg';
      const buffer = Buffer.from(match[2], 'base64');
      const fileName = `menu-items/${item.id}.${ext}`;

      const url = await uploadImage(buffer, fileName, contentType);
      await prisma.menuItem.update({ where: { id: item.id }, data: { image: url } });
      console.log(`  Migrated: ${item.name} (${(buffer.length / 1024).toFixed(0)}KB) → ${url}`);
    } catch (err) {
      console.error(`  FAILED: ${item.name}: ${err.message}`);
    }
  }

  console.log('Done');
  await prisma.$disconnect();
}

migrate().catch((e) => { console.error(e); process.exit(1); });
