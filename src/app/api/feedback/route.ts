import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { emailEvents } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { safeJsonParse } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 feedback submissions per hour per user
  const rateLimitResult = await rateLimit({
    keyPrefix: "feedback:submit",
    maxRequests: 10,
    windowSeconds: 3600,
    identifier: session.user.id,
  });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limited. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds) } }
    );
  }

  const raw = await request.text();
  const body = safeJsonParse<{ rating?: number; comment?: string | null }>(raw, null);
  if (!body || typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Rating (1-5) is required." }, { status: 400 });
  }

  await db.insert(emailEvents).values({
    userId: session.user.id,
    eventType: "feedback",
    recipientEmail: session.user.email,
    metadata: {
      rating: body.rating,
      comment: body.comment || null,
      path: request.headers.get("referer") || "",
    },
  });

  return NextResponse.json({ received: true });
}
