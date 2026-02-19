-- AlterTable: widen kitchenPin to store bcrypt hash (60 chars)
ALTER TABLE "Settings" ALTER COLUMN "kitchenPin" TYPE VARCHAR(72);
