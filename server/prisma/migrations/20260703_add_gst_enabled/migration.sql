-- Add master GST on/off toggle to Settings (default true preserves current behavior)
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "gstEnabled" BOOLEAN NOT NULL DEFAULT true;
