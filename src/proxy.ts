import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { loginRateLimit, signupRateLimit, passwordResetRateLimit } from "@/lib/rate-limit";
import { defaultLocale, locales } from "@/lib/i18n";
import { auth } from "@/lib/auth/auth";

// ── Maintenance mode utilities ────────────────────────────────────────────────

const MAINTENANCE_KEY = "mailmind:maintenance";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Check if maintenance mode is active via Upstash Redis REST API (fail-open). */
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

/**
 * Check if the request comes from an admin user by decoding the better-auth session JWT.
 * Uses Web APIs only (no Node Buffer) for edge compatibility.
 */
function isAdmin(request: NextRequest): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  try {
    const sessionCookie = request.cookies.get("better-auth.session_token")?.value;
    if (!sessionCookie) return false;

    // Decode JWT payload (second segment) — base64url → JSON
    const payload = sessionCookie.split(".")[1];
    if (!payload) return false;

    // Convert base64url to base64, then decode with atob (Web API)
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

/** Paths that are always accessible (never blocked by maintenance mode).
 * Uses regex to handle locale-prefixed paths since the locale redirect (Step 0)
 * runs before this check. e.g., /ro/login, /en/sign-up, /ro/maintenance. */
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
  if (pathname.includes(".")) return true; // static files
  return MAINTENANCE_ALLOWED.some((re) => re.test(pathname));
}

/**
 * Extract the client IP address from the request.
 * Checks common headers for proxied environments (Vercel, Cloudflare, etc.).
 */
function getClientIp(request: NextRequest): string {
  // Vercel / standard proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    if (firstIp) return firstIp.trim();
  }

  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // Fallback
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}

/**
 * Security headers applied to ALL responses.
 */
const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy (disable features not needed)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // DNS prefetch control
  "X-DNS-Prefetch-Control": "on",
};

/**
 * Content Security Policy header value.
 * Uses a strict policy: allows resources from the app itself, trusted CDNs, and analytics.
 * Includes 'unsafe-inline' for Next.js hydration scripts (required by the framework).
 * Only applied in production to avoid breaking dev server.
 */
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);
  let response = NextResponse.next();

  // ── Step -1: Fix host headers for proxied environments (Codespace, etc.) ───
  // When running behind a reverse proxy (GitHub Codespace, ngrok, etc.),
  // Next.js Server Actions check the origin against allowed origins and reject
  // requests if the forwarded host doesn't match. We rewrite the request URL
  // to use the forwarded host so Next.js sees the correct origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost && forwardedHost !== request.headers.get("host")) {
    const url = request.nextUrl.clone();
    url.host = forwardedHost;
    url.port = "";
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedProto) {
      url.protocol = forwardedProto;
    }
    // Use rewrite so Next.js knows the URL has changed for Server Actions validation
    response = NextResponse.rewrite(url);
  }

  // ── Step 0: Redirect bare paths to locale-prefixed paths ───────────────────
  // /dashboard → /ro/dashboard, /dashboard/war-room/... → /ro/dashboard/war-room/...
  // /sign-up → /ro/sign-up, /login → /ro/login, etc.
  if (!locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))) {
    // Static assets, API routes, _next paths — skip
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes(".")
    ) {
      // Skip — handled by Next.js
    } else {
      // Redirect to default locale
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // ── Step 0.25: Auth protection for protected routes ───────────────────────
  // Check if the path requires authentication (dashboard pages, protected APIs).
  // Locale-prefixed paths have the form /{locale}/dashboard/...
  // API routes don't have locale prefixes (they're at /api/... directly).

  // Extract locale from pathname (guaranteed to exist after Step 0)
  const localeMatch = pathname.match(new RegExp(`^/(${locales.join("|")})(/|$)`));
  const locale = localeMatch?.[1] || defaultLocale;
  const pathWithoutLocale = localeMatch
    ? pathname.slice(localeMatch[0].length - (localeMatch[2] || "").length) || "/"
    : pathname;

  const isProtectedPage =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/onboarding");

  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/webhooks/") &&
    !pathname.startsWith("/api/stripe/webhook") &&
    !pathname.startsWith("/api/klaviyo/") &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/usage"); // stub, no auth needed

  if (isProtectedPage || isProtectedApi) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        // API routes: return 401 JSON
        if (isProtectedApi) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
          );
        }
        // Page routes: redirect to login, preserving the original path
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // If session check fails (DB error, etc.), allow the request through.
      // Server actions and API routes have their own auth checks as fallback.
      console.warn("[Proxy] Session check failed for:", pathname);
    }
  }

  // ── Step 0.5: Maintenance mode check ──────────────────────────────────────
  if (!isMaintenanceAllowed(pathname)) {
    const active = await isMaintenanceActive();
    if (active && !isAdmin(request)) {
      // Use locale extracted in Step 0.25 (or fallback to default)
      const maintenanceUrl = new URL(`/${locale}/maintenance`, request.url);
      maintenanceUrl.searchParams.set("reason", "maintenance");
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // ── Step 0: Inject request ID for tracing ──────────────────────────────────
  const requestId = request.headers.get("x-request-id") || randomUUID();
  response.headers.set("X-Request-Id", requestId);

  // ── Step 1: Apply rate limiting to auth endpoints ──────────────────────────

  // Rate limit login (POST to sign-in API)
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

  // Rate limit signup (POST to sign-up API)
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

  // Rate limit password reset
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

  // ── Step 2: Apply security headers (production only) ───────────────────────

  if (process.env.NODE_ENV === "production") {
    // Standard security headers
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(header, value);
    }

    // Content Security Policy
    response.headers.set("Content-Security-Policy", getCspHeader());

    // HSTS
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

/**
 * Proxy matcher: runs on API routes and page routes.
 * Skips static assets, Next.js internals, and favicon.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
