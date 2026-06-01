import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { db } from "@/db/drizzle";
import { gmailConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/gmail/disconnect
 *
 * Removes the authenticated user's Gmail connection.
 * Revoking the token on Google's side requires the refresh token,
 * so we attempt that before deleting the row.
 */
export async function DELETE(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const [connection] = await db
      .select()
      .from(gmailConnections)
      .where(eq(gmailConnections.userId, user.id))
      .limit(1);

    if (!connection) {
      return NextResponse.json({ disconnected: true, message: "No Gmail connection found." });
    }

    // Revoke the token on Google's side (best-effort)
    // Prefer revoking the refresh token, which is long-lived.
    const tokenToRevoke = connection.refreshToken || connection.accessToken;
    if (tokenToRevoke) {
      try {
        await fetch("https://oauth2.googleapis.com/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: tokenToRevoke }),
        });
      } catch {
        // Non-fatal — Google will eventually expire the token
      }
    }

    await db
      .delete(gmailConnections)
      .where(eq(gmailConnections.userId, user.id));

    console.log(`[Gmail] Disconnected: user ${user.id.slice(0, 8)}…`);

    return NextResponse.json({ disconnected: true });
  } catch (error) {
    console.error("[Gmail] Disconnect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
