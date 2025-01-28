import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip authentication for homepage
  if (request.nextUrl.pathname === '/') {
    return
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclude root path and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|$).*)',
  ],
}