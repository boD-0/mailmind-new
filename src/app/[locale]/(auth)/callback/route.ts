import { NextResponse } from 'next/server'

/**
 * OAuth callback route — compatibility fallback.
 *
 * Better-Auth handles OAuth callbacks automatically via
 * `/api/auth/callback/{provider}` (handled by `toNextJsHandler(auth)`).
 * This route exists as a fallback for misconfigured OAuth redirect URIs
 * (e.g. Google redirecting to `/{locale}/callback` instead of `/api/auth/callback/google`).
 *
 * ⚠️  FIRST-TIME SETUP: In Google Cloud Console, set the redirect URI to:
 *    {YOUR_APP_URL}/api/auth/callback/google
 *    (NOT /callback or /auth/callback)
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const provider = searchParams.get('provider') || 'google'

  if (code) {
    // Forward to Better-Auth's callback handler which handles token exchange + session creation
    const callbackUrl = new URL(`/api/auth/callback/${provider}`, origin)
    callbackUrl.searchParams.set('code', code)
    if (searchParams.get('state')) {
      callbackUrl.searchParams.set('state', searchParams.get('state')!)
    }
    return NextResponse.redirect(callbackUrl)
  }

  // No code — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
