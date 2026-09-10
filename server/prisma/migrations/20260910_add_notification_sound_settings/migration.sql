-- AlterTable
-- Additive only, every column has a default, so existing rows keep working
-- and the deploy needs no backfill.
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "soundEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "soundVolume" INTEGER NOT NULL DEFAULT 70;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "newOrderTone" TEXT NOT NULL DEFAULT 'chime';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "staffCallTone" TEXT NOT NULL DEFAULT 'doorbell';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "staffCallRepeat" BOOLEAN NOT NULL DEFAULT false;
