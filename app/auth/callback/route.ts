import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getPublicOrigin } from '@/lib/utils/url'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()

  // Use getPublicOrigin to get the correct public URL (handles Docker/proxy scenarios)
  const headersList = await headers()
  const origin = getPublicOrigin(headersList)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const finalRedirect = redirectTo || '/'

      // Create response with proper cache headers to prevent caching issues
      const response = NextResponse.redirect(`${origin}${finalRedirect}`, {
        status: 303, // Use 303 See Other for POST->GET redirect pattern
      })

      // Add headers to prevent caching and ensure fresh content
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      return response
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
