import { NextResponse } from "next/server";
import { exchangeGmailCode } from "@/lib/gmail/oauth";
import { db } from "@/db/drizzle";
import { gmailConnections } from "@/db/schema";
import { redis } from "@/lib/redis";

/**
 * GET /api/gmail/callback
 *
 * Handles the Google OAuth callback for Gmail connection.
 * Validates the CSRF state token, exchanges the auth code for tokens,
 * and stores the Gmail connection in the database.
 *
 * Redirects to the settings page on success, or the dashboard on error.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  try {
    // ── Handle user denial ────────────────────────────────
    if (error === "access_denied") {
      return NextResponse.redirect(`${origin}/dashboard/settings?gmail=denied`);
    }

    if (!code || !state) {
      console.error("[Gmail] Callback missing code or state.");
      return NextResponse.redirect(`${origin}/dashboard/settings?gmail=error`);
    }

    // ── Validate CSRF state ───────────────────────────────
    const userId = await redis.get<string>(`gmail_oauth:${state}`);
    if (!userId) {
      console.error("[Gmail] Invalid or expired OAuth state.");
      return NextResponse.redirect(`${origin}/dashboard/settings?gmail=expired`);
    }

    // Consume the state token
    await redis.del(`gmail_oauth:${state}`);

    // ── Exchange code for tokens ──────────────────────────
    const tokens = await exchangeGmailCode(code);

    // ── Upsert Gmail connection (race-condition safe) ──────
    await db
      .insert(gmailConnections)
      .values({
        userId,
        googleEmail: tokens.googleEmail,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
        tokenExpiresAt: tokens.expiresAt,
      })
      .onConflictDoUpdate({
        target: gmailConnections.userId,
        set: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
          tokenExpiresAt: tokens.expiresAt,
          googleEmail: tokens.googleEmail,
          updatedAt: new Date(),
        },
      });

    console.log(`[Gmail] Connected: ${tokens.googleEmail} → user ${userId.slice(0, 8)}…`);
    return NextResponse.redirect(`${origin}/dashboard/settings?gmail=connected`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Gmail] Callback error:", message);
    return NextResponse.redirect(`${origin}/dashboard/settings?gmail=error`);
  }
}
