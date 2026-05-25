import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { safeJsonParse } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/email/send-test
 *
 * Sends a test email via the Resend API.
 * Requires authentication.
 *
 * Body: {
 *   to: string           — recipient email address
 *   subject: string      — email subject line
 *   html: string         — HTML email body content
 * }
 *
 * Returns: { success: true, messageId: string } or { error: string }
 */
export async function POST(req: Request) {
  const user = await apiRequireAuth(req);
  if (user instanceof NextResponse) return user;

  // Rate limit: 5 test emails per minute per user
  const rateLimitResult = await rateLimit({
    keyPrefix: "email:send-test",
    maxRequests: 5,
    windowSeconds: 60,
    identifier: user.id,
  });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Email send limit reached. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  try {
    const text = await req.text();
    const body = safeJsonParse<{ to?: string; subject?: string; html?: string }>(
      text,
      {}
    );
    const { to, subject, html } = body;

    // ── Validation ──────────────────────────────────────────
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient email (to) is required." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "A subject line is required." },
        { status: 400 }
      );
    }

    if (!html || typeof html !== "string" || html.trim().length === 0) {
      return NextResponse.json(
        { error: "Email body (html) is required." },
        { status: 400 }
      );
    }

    // Sanity limits
    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be under 200 characters." },
        { status: 400 }
      );
    }

    if (html.length > 100_000) {
      return NextResponse.json(
        { error: "Email body must be under 100 KB." },
        { status: 400 }
      );
    }

    // ── Resend API Key ──────────────────────────────────────
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[Email] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Set RESEND_API_KEY." },
        { status: 500 }
      );
    }

    // ── Send via Resend ─────────────────────────────────────
    const fromEmail = process.env.EMAIL_FROM || "MailMind <noreply@mailmind.ai>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: subject.trim(),
        html: html.trim(),
      }),
    });

    const resendData = await res.json();

    if (!res.ok) {
      console.error("[Email] Resend API error:", resendData);
      return NextResponse.json(
        {
          error: resendData?.message || "Failed to send test email via Resend.",
        },
        { status: res.status }
      );
    }

    console.log(
      `[Email] Test email sent by user ${user.id.slice(0, 8)}… to ${to.replace(/(.{2}).*(@.*)/, "$1***$2")} — messageId: ${resendData.id}`
    );

    return NextResponse.json({
      success: true,
      messageId: resendData.id as string,
    });
  } catch (error) {
    console.error("[Email] Send test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
