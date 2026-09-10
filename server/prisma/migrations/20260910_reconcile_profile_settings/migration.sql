-- Reconcile restaurant identity that drifted between "Restaurant" and "Settings".
--
-- Both tabs used to write both tables with different field sets: Profile synced
-- email to Settings, Settings did not sync it back. Production already had rows
-- where Settings.email was empty while Restaurant.email was set.
--
-- Restaurant is the origin (registration populates it), so it fills the gaps.
-- Only empty/NULL Settings values are touched — where both sides hold a real
-- value, nothing is overwritten, because we cannot know which the owner meant.

UPDATE "Settings" s
SET "email" = r."email"
FROM "Restaurant" r
WHERE s."restaurantId" = r.id
  AND COALESCE(NULLIF(TRIM(s."email"), ''), NULL) IS NULL
  AND COALESCE(NULLIF(TRIM(r."email"), ''), NULL) IS NOT NULL;

UPDATE "Settings" s
SET "phone" = r."phone"
FROM "Restaurant" r
WHERE s."restaurantId" = r.id
  AND COALESCE(NULLIF(TRIM(s."phone"), ''), NULL) IS NULL
  AND COALESCE(NULLIF(TRIM(r."phone"), ''), NULL) IS NOT NULL;

UPDATE "Settings" s
SET "address" = r."address"
FROM "Restaurant" r
WHERE s."restaurantId" = r.id
  AND COALESCE(NULLIF(TRIM(s."address"), ''), NULL) IS NULL
  AND COALESCE(NULLIF(TRIM(r."address"), ''), NULL) IS NOT NULL;

UPDATE "Settings" s
SET "restaurantName" = r."name"
FROM "Restaurant" r
WHERE s."restaurantId" = r.id
  AND COALESCE(NULLIF(TRIM(s."restaurantName"), ''), NULL) IS NULL
  AND r."name" IS NOT NULL;
