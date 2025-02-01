import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log(
    '[Middleware] Starting updateSession for path:',
    request.nextUrl.pathname
  )

  let supabaseResponse = NextResponse.next({
    request,
  })

  console.log('[Middleware] Creating Supabase client...')
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log(
            '[Middleware] Getting all cookies:',
            cookies.map((c) => c.name)
          )
          return cookies
        },
        setAll(cookiesToSet) {
          console.log(
            '[Middleware] Setting cookies:',
            cookiesToSet.map((c) => c.name)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  console.log('[Middleware] Fetching user...')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('[Middleware] User found:', user ? 'yes' : 'no')

  return supabaseResponse
}
