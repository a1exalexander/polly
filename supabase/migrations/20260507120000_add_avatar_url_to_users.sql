-- Add avatar_url column to Users table for Google profile pictures (and any future provider).
ALTER TABLE "public"."Users"
ADD COLUMN IF NOT EXISTS "avatar_url" text;
