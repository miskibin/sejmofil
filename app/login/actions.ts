'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGitHub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  })

  if (error) {
    console.error('Error signing in with GitHub:', error.message)
    return
  }
  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })

  if (error) {
    console.error('Error signing in with google:', error.message)
    return
  }
  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
}
