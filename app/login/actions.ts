'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGitHub(formData?: FormData) {
  const supabase = await createClient()
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://sejmofil.pl'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    console.error('Error signing in with GitHub:', error.message)
    redirect('/auth/auth-code-error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://sejmofil.pl'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error.message)
    redirect('/auth/auth-code-error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithFacebook(formData?: FormData) {
  const supabase = await createClient()
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://sejmofil.pl'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    console.error('Error signing in with Facebook:', error.message)
    redirect('/auth/auth-code-error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }

  redirect('/')
}
