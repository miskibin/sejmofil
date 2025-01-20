import { createClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session }
}
