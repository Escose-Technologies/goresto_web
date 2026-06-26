-- Rollback: Remove gstEnabled column added in 20260626_add_gst_enabled
ALTER TABLE "Settings" DROP COLUMN IF EXISTS "gstEnabled";
