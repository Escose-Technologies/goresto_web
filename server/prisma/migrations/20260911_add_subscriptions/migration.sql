-- CreateEnum
DO $$ BEGIN CREATE TYPE "SubscriptionPlan" AS ENUM ('free_trial','standard','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing','active','past_due','suspended','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "BillingCycle" AS ENUM ('monthly','yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PaymentMethodType" AS ENUM ('cash','upi','bank_transfer','card','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL DEFAULT 'free_trial',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
  "pricePaise" INTEGER NOT NULL DEFAULT 0,
  "billingCycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
  "trialEndsAt" TIMESTAMP(3),
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_restaurantId_key" ON "Subscription"("restaurantId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX IF NOT EXISTS "Subscription_plan_idx" ON "Subscription"("plan");
CREATE INDEX IF NOT EXISTS "Subscription_trialEndsAt_idx" ON "Subscription"("trialEndsAt");

CREATE TABLE IF NOT EXISTS "SubscriptionEvent" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "detail" JSONB,
  "reason" TEXT NOT NULL,
  "actorEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SubscriptionEvent_subscriptionId_idx" ON "SubscriptionEvent"("subscriptionId");
CREATE INDEX IF NOT EXISTS "SubscriptionEvent_restaurantId_idx"   ON "SubscriptionEvent"("restaurantId");
CREATE INDEX IF NOT EXISTS "SubscriptionEvent_createdAt_idx"      ON "SubscriptionEvent"("createdAt");

CREATE TABLE IF NOT EXISTS "SubscriptionPayment" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  "method" "PaymentMethodType" NOT NULL DEFAULT 'upi',
  "reference" TEXT,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "recordedByEmail" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_restaurantId_idx"   ON "SubscriptionPayment"("restaurantId");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_createdAt_idx"      ON "SubscriptionPayment"("createdAt");

CREATE TABLE IF NOT EXISTS "PlatformSetting" (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed the free-slot cap. 250 per the launch offer; superadmin can change it.
INSERT INTO "PlatformSetting" ("key","value","updatedAt")
VALUES ('freeTrialSlots', '250'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Backfill: every existing non-rejected restaurant was approved before
-- subscriptions existed. Give each a free year running from when it joined,
-- so nobody silently starts life as past_due.
INSERT INTO "Subscription" ("id","restaurantId","plan","status","pricePaise","billingCycle","trialEndsAt","createdAt","updatedAt")
SELECT 'sub_' || r.id, r.id, 'free_trial', 'trialing', 0, 'monthly',
       r."createdAt" + INTERVAL '1 year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Restaurant" r
WHERE r.status <> 'rejected'
  AND NOT EXISTS (SELECT 1 FROM "Subscription" s WHERE s."restaurantId" = r.id);

INSERT INTO "SubscriptionEvent" ("id","subscriptionId","restaurantId","type","reason","createdAt")
SELECT 'sube_' || s.id, s.id, s."restaurantId", 'created',
       'Backfilled on subscription rollout: free year from signup date', CURRENT_TIMESTAMP
FROM "Subscription" s
WHERE NOT EXISTS (SELECT 1 FROM "SubscriptionEvent" e WHERE e."subscriptionId" = s.id);
