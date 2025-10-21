import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatPage from './chat-page'

// Cache for 1 hour (auth check is still performed on each request)
export const revalidate = 3600

export default async function Chat() {
  // Check authentication on server side
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ChatPage />
}