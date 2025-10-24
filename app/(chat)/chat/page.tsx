import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatPage from './chat-page'

export default async function Chat() {
  // Check authentication on server side
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ChatPage />
}
