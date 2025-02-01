'use client'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
  CredenzaFooter,
} from '@/components/ui/credenza'
import { Github, Lock } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FaFacebook, FaGithub, FaGoogle, FaShieldAlt } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { OAuthResponse } from '@supabase/supabase-js'
import { Separator } from '@/components/ui/separator'

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

  function handleLogin(loginFunction: () => Promise<OAuthResponse>) {
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
              src={user.user_metadata.avatar_url || '/placeholder.svg'}
              alt="User avatar"
              height={32}
              width={32}
              className="h-8 w-8 rounded-full"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" side="bottom" align="end">
          <div className="flex flex-col space-y-1">
            <div className="mb-2 px-2 py-1.5">
              <div className="truncate text-sm font-medium">
                {user.user_metadata.name || ''}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>

            <Separator className="my-1" />

            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => router.push('/profile')}
            >
              Profil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-destructive hover:text-destructive"
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
    <Credenza onOpenChange={onOpenChange} open={defaultOpen}>
      <CredenzaTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Lock className="h-5 w-5 text-primary" />
          </Button>
        )}
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-md overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-background to-secondary/20 z-10',
            'pointer-events-none'
          )}
        />
        <div className="relative z-20">
          <CredenzaHeader className="space-y-2">
            <CredenzaTitle className="text-2xl text-center">
              Zaloguj się
            </CredenzaTitle>
            <CredenzaDescription className="text-center">
              {message ||
                'Zaloguj się aby uzyskać dostęp do wszystkich funkcji'}
            </CredenzaDescription>
          </CredenzaHeader>
          <div className="space-y-4 p-5">
            <Button
              type="button"
              onClick={() =>
                handleLogin(() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'github',
                  })
                )
              }
              className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white transition-all duration-300"
              variant="link"
            >
              <FaGithub className="mr-2 h-5 w-5" />
              Zaloguj się przez GitHub
            </Button>
            <Button
              type="button"
              onClick={() =>
                handleLogin(() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'google',
                  })
                )
              }
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm transition-all duration-300"
              variant="link"
            >
              <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
              Zaloguj się przez Google
            </Button>
            <Button
              onClick={() =>
                handleLogin(() =>
                  supabase.auth.signInWithOAuth({
                    provider: 'facebook',
                  })
                )
              }
              className="w-full bg-[#5865F2]  text-white transition-all duration-300"
              variant="link"
            >
              <FaFacebook className="mr-2 h-5 w-5" />
              Zaloguj się przez Facebook
            </Button>
            <div className="pt-4 text-center">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <FaShieldAlt className="h-4 w-4 mr-2 text-green-500" />
                Twoje dane są bezpieczne.
              </div>
            </div>
          </div>
          <CredenzaFooter>
            <p className="text-xs">
              Logując się akceptujesz{' '}
              <Link
                href="/terms-of-service"
                className="underline "
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/terms-of-service')
                  onOpenChange?.(false)
                }}
              >
                regulamin
              </Link>{' '}
              oraz{' '}
              <Link
                href="/privacy"
                className="underline "
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/privacy')
                  onOpenChange?.(false)
                }}
              >
                politykę prywatności
              </Link>
            </p>
          </CredenzaFooter>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
