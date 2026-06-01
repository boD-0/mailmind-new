import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { loginRateLimit, signupRateLimit, passwordResetRateLimit } from "@/lib/rate-limit";
import { defaultLocale, locales } from "@/lib/i18n";
import { auth } from "@/lib/auth/auth";
import { getClientIp } from "@/lib/get-client-ip";

const MAINTENANCE_KEY = "mailmind:maintenance";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function isMaintenanceActive(): Promise<boolean> {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  try {
    const res = await fetch(`${REDIS_URL}/get/${MAINTENANCE_KEY}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return false;
    const data = await res.json() as { result: string | null };
    return data.result === "true" || data.result === "1";
  } catch {
    return false;
  }
}

function isAdmin(request: NextRequest): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  try {
    const sessionCookie = request.cookies.get("better-auth.session_token")?.value;
    if (!sessionCookie) return false;
    const payload = sessionCookie.split(".")[1];
    if (!payload) return false;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const decoded = JSON.parse(json);
    const email: string | undefined = decoded?.email;
    if (!email) return false;
    return email.toLowerCase() === adminEmail.toLowerCase();
  } catch {
    return false;
  }
}

const MAINTENANCE_ALLOWED = [
  /^\/[a-z]{2}\/maintenance/,
  /^\/api\//,
  /^\/[a-z]{2}\/login/,
  /^\/[a-z]{2}\/sign-up/,
  /^\/[a-z]{2}\/onboarding/,
  /^\/[a-z]{2}\/callback/,
  /^\/_next\//,
  /^\/static\//,
];

function isMaintenanceAllowed(pathname: string): boolean {
  if (pathname.includes(".")) return true;
  return MAINTENANCE_ALLOWED.some((re) => re.test(pathname));
}

function getIpFromRequest(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    if (firstIp) return firstIp.trim();
  }
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
};

function getCspHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://us.i.posthog.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://xubohuah.github.io",
    "font-src 'self'",
    "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://api.openai.com https://openrouter.ai https://a.klaviyo.com https://api.resend.com",
    "frame-src 'self' https://js.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIpFromRequest(request);
  let response = NextResponse.next();

  // ── Step -1: Fix host headers for proxied environments ────────────────────
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost && forwardedHost !== request.headers.get("host")) {
    // Skip rewrite for Inngest requests to avoid breaking execution
    if (!pathname.startsWith("/api/inngest")) {
      const url = request.nextUrl.clone();
      url.host = forwardedHost;
      url.port = "";
      const forwardedProto = request.headers.get("x-forwarded-proto");
      if (forwardedProto) {
        url.protocol = forwardedProto;
      }
      response = NextResponse.rewrite(url);
    }
  }

  // ── Step 0: Redirect bare paths to locale-prefixed paths ──────────────────
  if (!locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))) {
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes(".")
    ) {
      // Skip
    } else {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // ── Step 0.25: Auth protection ────────────────────────────────────────────
  const localeMatch = pathname.match(new RegExp(`^/(${locales.join("|")})(/|$)`));
  const locale = localeMatch?.[1] || defaultLocale;
  const pathWithoutLocale = localeMatch
    ? pathname.slice(localeMatch[0].length - (localeMatch[2] || "").length) || "/"
    : pathname;

  response.headers.set("x-locale", locale);

  const isProtectedPage =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/onboarding");

  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/inngest") &&
    !pathname.startsWith("/api/webhooks/") &&
    !pathname.startsWith("/api/stripe/webhook") &&
    !pathname.startsWith("/api/klaviyo/") &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/usage");

  if (isProtectedPage || isProtectedApi) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        if (isProtectedApi) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
          );
        }
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      console.warn("[Proxy] Session check failed for:", pathname);
    }
  }

  // ── Step 0.5: Maintenance mode check ──────────────────────────────────────
  if (!isMaintenanceAllowed(pathname)) {
    const active = await isMaintenanceActive();
    if (active && !isAdmin(request)) {
      const maintenanceUrl = new URL(`/${locale}/maintenance`, request.url);
      maintenanceUrl.searchParams.set("reason", "maintenance");
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // ── Step 0: Inject request ID ─────────────────────────────────────────────
  const requestId = request.headers.get("x-request-id") || randomUUID();
  response.headers.set("X-Request-Id", requestId);

  // ── Step 1: Rate limiting ─────────────────────────────────────────────────
  if (pathname.startsWith("/api/auth/sign-in") && request.method === "POST") {
    const rateLimitResult = await loginRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        },
      );
    }
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
  }

  if (pathname.startsWith("/api/auth/sign-up") && request.method === "POST") {
    const rateLimitResult = await signupRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        },
      );
    }
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
  }

  if (pathname.startsWith("/api/auth/reset-password") && request.method === "POST") {
    const rateLimitResult = await passwordResetRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        },
      );
    }
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
  }

  // ── Step 2: Security headers (production only) ────────────────────────────
  if (process.env.NODE_ENV === "production") {
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(header, value);
    }
    response.headers.set("Content-Security-Policy", getCspHeader());
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};