-- CreateTable: persistent staff-call notifications (30-day retention, read/unread)
CREATE TABLE "StaffCall" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffCall_restaurantId_idx" ON "StaffCall"("restaurantId");

-- CreateIndex
CREATE INDEX "StaffCall_restaurantId_read_idx" ON "StaffCall"("restaurantId", "read");

-- CreateIndex
CREATE INDEX "StaffCall_createdAt_idx" ON "StaffCall"("createdAt");

-- AddForeignKey
ALTER TABLE "StaffCall" ADD CONSTRAINT "StaffCall_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
