-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('pending', 'active', 'rejected');

-- AlterEnum
ALTER TYPE "FoodType" ADD VALUE 'egg';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "status" "RestaurantStatus" NOT NULL DEFAULT 'pending';

-- Backfill existing restaurants as active
UPDATE "Restaurant" SET "status" = 'active';

-- CreateIndex
CREATE INDEX "Restaurant_status_idx" ON "Restaurant"("status");
