import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add safety for potential body reading
  // If we ever need to read the body, we should do it safely:
  // const text = await request.text();
  // const data = safeJsonParse(text, null);

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // We only want to redirect root or pages, not static files or API routes
    if (
      pathname === '/' ||
      (!pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.includes('.'))
    ) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}${pathname}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
