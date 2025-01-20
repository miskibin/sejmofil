'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGitHub(formData: FormData) {
  const supabase = await createClient()
  const returnPath = formData.get('returnPath')?.toString() || '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/auth/callback?next=${encodeURIComponent(returnPath)}`,
      skipBrowserRedirect: true,
    },
  })
  if (error) {
    console.error('Error signing in with GitHub:', error.message)
    return
  }
  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
}

// Remove signup function since we're using only GitHub auth
// Remove signup function since we're using only GitHub auth
