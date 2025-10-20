import { createClient } from '@/utils/supabase/server'
import { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user from Supabase
 * This function should only be used in Server Components and Server Actions
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting user:', error.message)
      return null
    }

    return user
  } catch (error) {
    console.error('Unexpected error getting user:', error)
    return null
  }
}

/**
 * Check if a user is authenticated
 * This function should only be used in Server Components and Server Actions
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
