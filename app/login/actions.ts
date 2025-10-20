'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGitHub(formData?: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${redirectTo}`,
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
  const origin = (await headers()).get('origin')
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${redirectTo}`,
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
  const origin = (await headers()).get('origin')
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${origin}/auth/callback?redirect_to=${redirectTo}`,
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
