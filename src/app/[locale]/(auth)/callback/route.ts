import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Verificăm dacă utilizatorul a finalizat onboarding-ul
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_data')
          .eq('id', user.id)
          .single()

        const hasCompletedOnboarding = profile?.onboarding_data && Object.keys(profile.onboarding_data).length > 0
        const destination = hasCompletedOnboarding ? next : '/onboarding'

        const posthog = getPostHogClient()
        posthog.identify({
          distinctId: user.id,
          properties: { email: user.email },
        })
        posthog.capture({
          distinctId: user.id,
          event: 'user_signed_in',
          properties: {
            email: user.email,
            has_completed_onboarding: !!hasCompletedOnboarding,
          },
        })

        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
