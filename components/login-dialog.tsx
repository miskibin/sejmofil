'use client'

import { signInWithGitHub, signInWithGoogle } from '@/app/login/actions'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Github, Lock, Mail } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FaFacebook, FaGoogle } from 'react-icons/fa'

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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  function handleLogin(loginFunction: () => Promise<void>) {
    sessionStorage.setItem('returnPath', currentPath)
    loginFunction()
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
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'github',
              })
            }
            className="flex w-full items-center gap-2"
            variant="outline"
          >
            <Github className="h-5 w-5" />
            Zaloguj się przez GitHub
          </Button>
          <Button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'google',
              })
            }
            className="flex w-full items-center gap-2"
            variant="outline"
          >
            <FaGoogle className="h-5 w-5" />
            Zaloguj się przez Google
          </Button>
          <Button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'facebook',
              })
            }
            className="flex w-full items-center gap-2"
            variant="outline"
          >
            <FaFacebook className="h-5 w-5" />
            Zaloguj się przez facebook
          </Button>
        </form>
        <DialogFooter className="mt-4 flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <div className="text-xs text-muted-foreground">
            Logując się akceptujesz{' '}
            <Link
              href="/terms-of-service"
              className="underline hover:text-primary"
            >
              regulamin
            </Link>{' '}
            oraz{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              politykę prywatności
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
