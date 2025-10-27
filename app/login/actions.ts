'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPublicOrigin } from '@/lib/utils/url'

export async function signInWithGitHub(formData?: FormData) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = getPublicOrigin(headersList)
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  // Get the referer to preserve mobile/desktop origin
  const referer = headersList.get('referer')
  const callbackOrigin = referer ? new URL(referer).origin : origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${callbackOrigin}/auth/callback?redirect_to=${redirectTo}`,
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
  const headersList = await headers()
  const origin = getPublicOrigin(headersList)
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  // Get the referer to preserve mobile/desktop origin
  const referer = headersList.get('referer')
  const callbackOrigin = referer ? new URL(referer).origin : origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${callbackOrigin}/auth/callback?redirect_to=${redirectTo}`,
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
  const headersList = await headers()
  const origin = getPublicOrigin(headersList)
  const redirectTo = formData?.get('redirectTo')?.toString() || '/'

  // Get the referer to preserve mobile/desktop origin
  const referer = headersList.get('referer')
  const callbackOrigin = referer ? new URL(referer).origin : origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${callbackOrigin}/auth/callback?redirect_to=${redirectTo}`,
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
