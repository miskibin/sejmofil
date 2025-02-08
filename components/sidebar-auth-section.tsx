'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { LoginDialog } from './login-dialog'
import { useState } from 'react'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'

export function SidebarAuthSection() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const session = useSupabaseSession()
  const user = session?.user

  return (
    <div className="space-y-4">
      <h3 className="text-3xl font-semibold leading-tight">
        {user ? (
          <>
            Witaj{' '}
            <span className="text-primary">
              {user.user_metadata.name.split(' ')[0]}
            </span>
          </>
        ) : (
          <>
            Komentuj poczynania{' '}
            <span className="text-primary">polskich polityków</span>
          </>
        )}
      </h3>
      {!user && (
        <>
          <Button className="rounded-full" onClick={() => setIsLoginOpen(true)}>
            Zaloguj się
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <LoginDialog
            onOpenChange={setIsLoginOpen}
            defaultOpen={isLoginOpen}
          />
        </>
      )}
    </div>
  )
}
