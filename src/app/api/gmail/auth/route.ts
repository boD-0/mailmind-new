import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { generateGmailAuthUrl } from "@/lib/gmail/oauth";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";

/**
 * GET /api/gmail/auth
 *
 * Initiates the Gmail OAuth flow. Redirects the user to Google's consent screen.
 * Requires authentication.
 *
 * Stores a CSRF state token in Redis (5-min TTL) to validate the callback.
 */
export async function GET(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    // Generate CSRF state bound to this user's session
    const state = `gmail_${user.id}_${randomUUID().replace(/-/g, "")}`;
    await redis.set(`gmail_oauth:${state}`, user.id, { ex: 300 });

    const authUrl = generateGmailAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Gmail] Auth initiation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
