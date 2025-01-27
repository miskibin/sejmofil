'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGitHub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  })
  console.log(data)

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
