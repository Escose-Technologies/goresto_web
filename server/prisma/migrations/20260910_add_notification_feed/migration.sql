-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('order_new', 'staff_call', 'bill_new', 'review_new');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "refId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_restaurantId_idx" ON "Notification"("restaurantId");
CREATE INDEX IF NOT EXISTS "Notification_restaurantId_read_idx" ON "Notification"("restaurantId", "read");
CREATE INDEX IF NOT EXISTS "Notification_restaurantId_createdAt_idx" ON "Notification"("restaurantId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Backfill: carry existing staff calls into the feed so the notification
-- centre does not appear to lose history the moment this ships.
INSERT INTO "Notification" ("id", "restaurantId", "type", "title", "body", "refId", "read", "createdAt")
SELECT
  'sc_' || sc."id",
  sc."restaurantId",
  'staff_call'::"NotificationType",
  'Table ' || sc."tableNumber" || ' needs assistance',
  sc."customerName",
  sc."id",
  sc."read",
  sc."createdAt"
FROM "StaffCall" sc
WHERE NOT EXISTS (SELECT 1 FROM "Notification" n WHERE n."refId" = sc."id");
