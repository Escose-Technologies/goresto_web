-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('pure_veg', 'non_veg', 'both');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('tax_invoice', 'bill_of_supply');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'card', 'upi', 'split');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid', 'partially_paid', 'cancelled');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'flat');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('dine_in', 'takeaway', 'delivery');

-- CreateEnum
CREATE TYPE "DiscountScope" AS ENUM ('bill', 'item_category', 'item_specific');

-- CreateEnum
CREATE TYPE "GstScheme" AS ENUM ('regular', 'composition');

-- CreateEnum
CREATE TYPE "ThermalWidth" AS ENUM ('eighty_mm', 'fifty_eight_mm');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billId" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "foodType" "FoodType" NOT NULL DEFAULT 'both';

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "autoPrintOnBill" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "billFooterText" TEXT DEFAULT 'Thank you for dining with us!',
ADD COLUMN     "billPrefix" TEXT NOT NULL DEFAULT 'INV',
ADD COLUMN     "defaultPackagingCharge" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "enablePackagingCharge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableRoundOff" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fssaiNumber" TEXT,
ADD COLUMN     "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "gstScheme" "GstScheme" NOT NULL DEFAULT 'regular',
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "placeOfSupplyCode" TEXT,
ADD COLUMN     "serviceChargeLabel" TEXT DEFAULT 'Service Charge',
ADD COLUMN     "showFeedbackQR" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showServiceCharge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thermalPrinterWidth" "ThermalWidth" NOT NULL DEFAULT 'eighty_mm';

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "billType" "BillType" NOT NULL DEFAULT 'tax_invoice',
    "financialYear" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "billItems" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "totalItemDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "afterItemDiscount" DOUBLE PRECISION NOT NULL,
    "billDiscountType" "DiscountType",
    "billDiscountValue" DOUBLE PRECISION DEFAULT 0,
    "billDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "afterAllDiscounts" DOUBLE PRECISION NOT NULL,
    "serviceChargeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceChargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packagingCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "cgstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "discountDetails" JSONB,
    "discountPresetId" TEXT,
    "discountReason" TEXT,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'cash',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "splitPayments" JSONB,
    "customerName" TEXT,
    "customerMobile" TEXT,
    "customerGstin" TEXT,
    "tableNumber" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL DEFAULT 'dine_in',
    "notes" TEXT,
    "createdBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "creditNoteNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSequence" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BillSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountPreset" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" "DiscountScope" NOT NULL DEFAULT 'bill',
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minBillAmount" DOUBLE PRECISION,
    "applicableCategories" TEXT[],
    "applicableItemIds" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "activeDays" INTEGER[],
    "requiresReason" BOOLEAN NOT NULL DEFAULT false,
    "maxDiscountAmount" DOUBLE PRECISION,
    "autoSuggest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bill_restaurantId_idx" ON "Bill"("restaurantId");

-- CreateIndex
CREATE INDEX "Bill_restaurantId_createdAt_idx" ON "Bill"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "Bill_restaurantId_paymentStatus_idx" ON "Bill"("restaurantId", "paymentStatus");

-- CreateIndex
CREATE INDEX "Bill_restaurantId_tableNumber_createdAt_idx" ON "Bill"("restaurantId", "tableNumber", "createdAt");

-- CreateIndex
CREATE INDEX "Bill_billNumber_idx" ON "Bill"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_restaurantId_financialYear_sequenceNumber_key" ON "Bill"("restaurantId", "financialYear", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BillSequence_restaurantId_financialYear_key" ON "BillSequence"("restaurantId", "financialYear");

-- CreateIndex
CREATE INDEX "DiscountPreset_restaurantId_isActive_idx" ON "DiscountPreset"("restaurantId", "isActive");

-- CreateIndex
CREATE INDEX "Order_billId_idx" ON "Order"("billId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSequence" ADD CONSTRAINT "BillSequence_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountPreset" ADD CONSTRAINT "DiscountPreset_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
