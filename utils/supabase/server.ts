// middleware.ts (Updated)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Use async cookie handling for Next.js 15
        getAll: async () => {
          const cookies = request.cookies.getAll()
          return cookies.map((c) => ({ name: c.name, value: c.value }))
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Only modify RESPONSE cookies, not request
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Handle auth callback route first
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      return response
    }

    // if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Handle failed auth check gracefully
    return NextResponse.next()
  }

  return response
}
