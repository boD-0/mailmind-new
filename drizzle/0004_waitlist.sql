-- Waitlist table for early bird signups
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text,
  "referral_source" text,
  "early_bird" boolean NOT NULL DEFAULT false,
  "early_bird_claimed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_waitlist_email" ON "waitlist" ("email");
CREATE INDEX IF NOT EXISTS "idx_waitlist_created_at" ON "waitlist" ("created_at");
