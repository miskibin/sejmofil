import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useSupabaseSession() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user)
      })
      .catch((err) => {
        console.error('Error fetching user:', err)
        setError(err)
      })

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Error in auth state change:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, error }
}
