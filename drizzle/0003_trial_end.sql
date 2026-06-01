-- Add trial_end column to users table for 14-day Professional trial
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_end" timestamp;
