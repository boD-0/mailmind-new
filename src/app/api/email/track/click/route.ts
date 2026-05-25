import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { emailEvents } from "@/db/schema";

/**
 * GET /api/email/track/click — Click tracking redirect
 *
 * Wraps URLs in emails to record clicks before redirecting.
 * Usage: <a href="https://mailmind.app/api/email/track/click?uid=<userId>&cid=<campaignId>&eid=<emailHash>&url=<encodedURL>">
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const cid = searchParams.get("cid");
  const eid = searchParams.get("eid");
  const targetUrl = searchParams.get("url");

  // Record click event
  if (uid) {
    try {
      await db.insert(emailEvents).values({
        userId: uid,
        campaignId: cid || null,
        eventType: "click",
        recipientEmail: eid || "unknown",
        metadata: {
          clickUrl: targetUrl || "",
          userAgent: request.headers.get("user-agent") || "",
          ip: request.headers.get("x-forwarded-for") || "",
        },
      });
    } catch (err) {
      console.error("[EmailTrack] Click tracking error:", err);
    }
  }

  // Redirect to target URL, fallback to home
  let redirectTo = "https://mailmind.app";
  if (targetUrl) {
    try {
      const decoded = decodeURIComponent(targetUrl);
      // Only allow http/https URLs to prevent open redirect attacks
      if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        redirectTo = decoded;
      }
    } catch {
      // Invalid URL encoding, use default
    }
  }

  return NextResponse.redirect(redirectTo, { status: 302 });
}
