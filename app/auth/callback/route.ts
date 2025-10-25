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
      if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
      
      // Default redirect to home page
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
