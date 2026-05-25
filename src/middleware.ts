import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware — protects authenticated routes and handles OAuth callbacks.
 *
 * PUBLIC routes (no auth required):
 *   /login, /sign-up, /demo, /pricing, /onboarding, /maintenance
 *   /api/auth/* (Better-Auth handlers)
 *   / (landing page)
 *
 * PROTECTED routes (auth required):
 *   /dashboard/*, /admin/*
 *
 * Behaviour:
 *   - If no session → redirect to /login?redirect=<original>
 *   - If session exists → allow through
 *   - API routes: return 401 JSON instead of redirect
 */

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/sign-up",
  "/signup",
  "/callback",
  "/demo",
  "/pricing",
  "/onboarding",
  "/maintenance",
  "/api/auth",
  "/api/webhooks",
  "/api/stripe",
];

function isPublicPath(pathname: string): boolean {
  // Landing page root (e.g., /, /en, /ro)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return true;

  // Check against all prefixes, accounting for locale prefix
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (pathname.includes(prefix)) return true;
  }

  return false;
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/fonts") ||
    /\.(ico|png|jpg|jpeg|svg|css|js|woff2?|ttf|eot|map|webmanifest|xml|txt)$/.test(pathname)
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname.includes("/api/");
}

const VALID_LOCALES = ["en", "ro", "fr", "de"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, verify the session cookie exists.
  // We do a lightweight check (cookie presence) rather than a full
  // DB session lookup on every request for performance.
  // Full session validation happens in the API route / page loader.
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    // No session cookie → redirect to login
    const segments = pathname.split("/").filter(Boolean);
    const rawLocale = segments[0] ?? "en";
    const locale = VALID_LOCALES.includes(rawLocale) ? rawLocale : "en";

    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie exists — allow request.
  // Full validation (expiry, DB check) is done by the page/API handler.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
