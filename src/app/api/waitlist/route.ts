import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { waitlist } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { safeJsonParse } from "@/lib/utils";

/**
 * POST /api/waitlist
 *
 * Join the waitlist. Captures email + optional name/source.
 * First 100 signups get early bird access (3 months STARTER free).
 *
 * Body: { email: string, name?: string, referralSource?: string }
 * Returns: { success: true, position: number, earlyBird: boolean }
 */
export async function POST(req: Request) {
  // Rate limit: 3 waitlist joins per hour per IP
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rateLimitResult = await rateLimit({
    keyPrefix: "waitlist:join",
    maxRequests: 3,
    windowSeconds: 3600,
    identifier: ip,
  });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many signups. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const text = await req.text();
    const body = safeJsonParse<{ email?: string; name?: string; referralSource?: string }>(text, {});
    const { email, name, referralSource } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 320) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Validate name length (cap at 150 chars to prevent abuse)
    if (name && typeof name === "string" && name.length > 150) {
      return NextResponse.json(
        { error: "Name must be under 150 characters." },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existing = await db
      .select({ id: waitlist.id })
      .from(waitlist)
      .where(eq(waitlist.email, email.trim().toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    // Count current waitlist size to determine position + early bird
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waitlist);

    const count = row?.count ?? 0;
    const position = count + 1;
    const earlyBird = position <= 100;

    // Insert
    await db.insert(waitlist).values({
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      referralSource: referralSource?.trim() || null,
      earlyBird,
    });

    console.log(
      `[Waitlist] New signup: ${email.replace(/(.{2}).*(@.*)/, "$1***$2")} — position #${position}${earlyBird ? " 🎉 EARLY BIRD" : ""}`
    );

    return NextResponse.json({
      success: true,
      position,
      earlyBird,
      total: position,
    });
  } catch (error) {
    console.error("[Waitlist] Join error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist
 *
 * Returns waitlist stats: total signups, early bird spots remaining.
 * Public endpoint — no auth required.
 */
export async function GET() {
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waitlist);

    const count = row?.count ?? 0;
    const earlyBirdRemaining = Math.max(0, 100 - count);

    return NextResponse.json({
      total: count,
      earlyBirdRemaining,
      earlyBirdTotal: 100,
    });
  } catch (error) {
    console.error("[Waitlist] Stats error:", error);
    return NextResponse.json(
      { total: 0, earlyBirdRemaining: 100, earlyBirdTotal: 100 }
    );
  }
}
