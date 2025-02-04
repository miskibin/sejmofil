import { updateSession } from '@/utils/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Apply middleware to all routes except...
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/images).*)',
  ],
}
