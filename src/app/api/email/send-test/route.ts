import { NextResponse } from "next/server";
import { apiRequireAuth } from "@/lib/auth/gatekeeper";
import { rateLimit } from "@/lib/rate-limit";
import { emailSendTestSchema, validateBody } from "@/lib/validate";
import { sanitizeHtml } from "@/lib/sanitize";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp } from "@/lib/get-client-ip";

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
    let body: unknown;
    try {
      body = JSON.parse(text || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Zod validation
    const parsed = validateBody(emailSendTestSchema, body);
    if (parsed instanceof NextResponse) return parsed;
    let { to, subject, html } = parsed;

    // Sanitize HTML content (strip scripts, event handlers)
    html = sanitizeHtml(html);

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

    // Audit log
    logAuditEvent({
      userId: user.id,
      action: "email.send_test",
      metadata: { messageId: resendData.id as string },
      ipAddress: getClientIp(req),
    }).catch(() => {});

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
