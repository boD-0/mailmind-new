import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { gmailConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/gmail/status
 *
 * Returns the current Gmail connection status for the authenticated user.
 * Response: { connected: boolean, googleEmail?: string }
 */
export async function GET(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const [connection] = await db
      .select({
        googleEmail: gmailConnections.googleEmail,
        tokenExpiresAt: gmailConnections.tokenExpiresAt,
        refreshToken: gmailConnections.refreshToken,
      })
      .from(gmailConnections)
      .where(eq(gmailConnections.userId, user.id))
      .limit(1);

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    // Report as connected even if token is expired (auto-refresh will handle it)
    return NextResponse.json({
      connected: true,
      googleEmail: connection.googleEmail,
    });
  } catch (error) {
    console.error("[Gmail] Status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
