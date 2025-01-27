'use client'

import { signInWithGitHub } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Github, Lock } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type LoginDialogProps = {
  trigger?: React.ReactNode
  message?: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LoginDialog({
  trigger,
  message,
  defaultOpen,
  onOpenChange,
}: LoginDialogProps) {
  const currentPath = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const returnPath = sessionStorage.getItem('returnPath')
    if (returnPath) {
      router.push(returnPath)
      sessionStorage.removeItem('returnPath')
    }
  }, [])

  function handleLogin() {
    sessionStorage.setItem('returnPath', currentPath)
    signInWithGitHub()
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.refresh()
    }
  }

  if (user) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image 
              src={user.user_metadata.avatar_url} 
              alt="User avatar"
              height={32}
              width={32}
              className="h-8 w-8 rounded-full"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2">
              <Image 
                src={user.user_metadata.avatar_url} 
                alt="User avatar"
                height={32}
                width={32}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium">
                {user.user_metadata.preferred_username || user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/profile')}
            >
              Profil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={handleLogout}
            >
              Wyloguj się
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Lock className="h-5 w-5 text-primary" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logowanie</DialogTitle>
          <DialogDescription>
            {message || 'Zaloguj się aby uzyskać dostęp do wszystkich funkcji'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4">
          <input type="hidden" name="returnPath" value={currentPath} />
          <Button
            formAction={handleLogin}
            className="flex w-full items-center gap-2"
            variant="outline"
          >
            <Github className="h-5 w-5" />
            Zaloguj się przez GitHub
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
