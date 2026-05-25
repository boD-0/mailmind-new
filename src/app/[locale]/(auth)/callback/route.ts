import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

/**
 * OAuth callback route — compatibility fallback.
 *
 * Better-Auth handles OAuth callbacks automatically via
 * `/api/auth/callback/{provider}` (handled by `toNextJsHandler(auth)`).
 * This route exists as a fallback for misconfigured OAuth redirect URIs.
 *
 * ⚠️  FIRST-TIME SETUP: In Google Cloud Console, set the redirect URI to:
 *    {YOUR_APP_URL}/api/auth/callback/google
 *    (NOT /callback or /auth/callback)
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const provider = searchParams.get('provider') || 'google'
  const next = searchParams.get('next') ?? '/dashboard'

  // If Google redirects here (old config), try to create a session via Better-Auth
  if (code) {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      if (session) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      // Session check failed — try the Better-Auth callback directly
    }

    // Forward to Better-Auth's callback handler
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
