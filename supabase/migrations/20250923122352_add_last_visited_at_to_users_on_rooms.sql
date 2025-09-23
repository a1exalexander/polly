-- Add last_visited_at column to UsersOnRooms table to track room visits
ALTER TABLE "public"."UsersOnRooms" 
ADD COLUMN "last_visited_at" timestamp with time zone DEFAULT now();

-- Update existing records to set last_visited_at to created_at
UPDATE "public"."UsersOnRooms" 
SET "last_visited_at" = "created_at" 
WHERE "last_visited_at" IS NULL;

-- Create index for efficient querying of recent visits
CREATE INDEX IF NOT EXISTS "idx_users_on_rooms_last_visited_at" 
ON "public"."UsersOnRooms" ("public_user_id", "last_visited_at" DESC);
