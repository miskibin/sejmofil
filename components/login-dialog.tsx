'use client'

import { signInWithGitHub } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
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
import { useEffect } from 'react'

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
