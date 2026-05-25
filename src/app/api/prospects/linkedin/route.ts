import { NextResponse } from "next/server";
import { fetchLinkedinProfile, searchLinkedinProfile } from "@/lib/proxycurl/client";
import { tieredAiRateLimit } from "@/lib/rate-limit";
import { getUserWithPlan } from "@/lib/auth/gatekeeper";

/**
 * POST /api/prospects/linkedin
 *
 * Enrich a prospect using their LinkedIn profile URL.
 *
 * Body: { linkedinUrl: string }
 * Returns: EnrichedProspect or { searchResult: string } for search mode
 *
 * Also supports search mode:
 * Body: { name: string, company?: string }
 * Returns: { linkedinUrl: string | null, profile: EnrichedProspect | null }
 */
export async function POST(request: Request) {
  // Authenticate + get plan via getUserWithPlan (single call — no redundant auth)
  const user = await getUserWithPlan(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tiered rate limit
  const rateLimitResult = await tieredAiRateLimit(user.plan, user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Mode 1: Enrich by LinkedIn URL
  if (body.linkedinUrl && typeof body.linkedinUrl === "string") {
    if (!body.linkedinUrl.includes("linkedin.com")) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }

    const profile = await fetchLinkedinProfile(body.linkedinUrl);
    if (!profile) {
      return NextResponse.json(
        { error: "Could not fetch LinkedIn profile. Check the URL or try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ profile });
  }

  // Mode 2: Search by name + company
  if (body.name && typeof body.name === "string") {
    const linkedinUrl = await searchLinkedinProfile(body.name, body.company || undefined);

    if (!linkedinUrl) {
      return NextResponse.json({ linkedinUrl: null, profile: null });
    }

    const profile = await fetchLinkedinProfile(linkedinUrl);
    return NextResponse.json({ linkedinUrl, profile });
  }

  return NextResponse.json(
    { error: "Provide either linkedinUrl or name (+ company)" },
    { status: 400 }
  );
}
