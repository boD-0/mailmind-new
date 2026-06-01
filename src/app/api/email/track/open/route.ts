import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { emailEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/email/track/open — Tracking pixel
 *
 * This is a 1x1 transparent GIF pixel that records email opens.
 * Usage: <img src="https://mailmind.app/api/email/track/open?uid=<userId>&cid=<campaignId>&eid=<emailHash>" />
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const cid = searchParams.get("cid");

  if (!uid) {
    return trackingPixel();
  }

  // Deduplicate opens within 5 minutes for the same user+recipient
  try {
    const existing = await db
      .select({ id: emailEvents.id })
      .from(emailEvents)
      .where(
        and(
          eq(emailEvents.userId, uid),
          eq(emailEvents.eventType, "open"),
          eq(emailEvents.recipientEmail, searchParams.get("eid") || "unknown"),
          sql`${emailEvents.createdAt} > NOW() - INTERVAL '5 minutes'`
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(emailEvents).values({
        userId: uid,
        campaignId: cid || null,
        eventType: "open",
        recipientEmail: searchParams.get("eid") || "unknown",
        metadata: {
          userAgent: request.headers.get("user-agent") || "",
          ip: request.headers.get("x-forwarded-for") || "",
          referer: request.headers.get("referer") || "",
        },
      });
    }
  } catch (err) {
    console.error("[EmailTrack] Open tracking error:", err);
  }

  return trackingPixel();
}

/** Returns a 1x1 transparent GIF */
function trackingPixel() {
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
