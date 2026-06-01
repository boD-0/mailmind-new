-- Migration: Mark all existing users as email-verified.
-- Run BEFORE deploying requireEmailVerification: true in auth.ts
-- to avoid locking out existing users who never verified their email.

UPDATE "users" SET "email_verified" = true WHERE "email_verified" = false;
