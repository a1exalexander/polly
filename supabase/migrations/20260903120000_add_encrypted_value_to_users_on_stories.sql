-- Votes are now stored encrypted on the client side so that the raw numbers
-- are not readable from the realtime websocket / REST payloads in devtools.
-- The plain "value" column is kept for backwards compatibility with old rows
-- and is no longer written by the app.
ALTER TABLE "public"."UsersOnStories"
ADD COLUMN IF NOT EXISTS "encrypted_value" text;
