'use client'

import { signInWithGitHub } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Github, Lock } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface LoginDialogProps {
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
          <DialogTitle>Zaloguj się</DialogTitle>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </DialogHeader>
        <form className="space-y-4">
          <input type="hidden" name="returnPath" value={currentPath} />
          <Button
            formAction={signInWithGitHub}
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
