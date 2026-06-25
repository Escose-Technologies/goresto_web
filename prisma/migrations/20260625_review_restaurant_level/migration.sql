-- AlterTable: make menuItemId optional and add customerMobile
ALTER TABLE "Review" ALTER COLUMN "menuItemId" DROP NOT NULL;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "customerMobile" TEXT;
