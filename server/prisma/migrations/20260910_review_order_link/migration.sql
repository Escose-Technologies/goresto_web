-- AlterTable
-- Nullable and additive: reviews left before this shipped simply have no link,
-- and no backfill is attempted — matching on name/mobile would guess, and a
-- wrong order link is worse than none.
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
CREATE INDEX IF NOT EXISTS "Review_orderId_idx" ON "Review"("orderId");
