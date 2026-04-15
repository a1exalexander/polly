-- Add is_admin column to UsersOnRooms so room owner can grant admin permissions
ALTER TABLE "public"."UsersOnRooms"
ADD COLUMN "is_admin" boolean NOT NULL DEFAULT false;

-- Backfill: keep existing rows explicitly false (default already handles new rows)
UPDATE "public"."UsersOnRooms"
SET "is_admin" = false
WHERE "is_admin" IS NULL;
