"use client";

import { Button } from "@/components/ui/button";
import { Lock, Github } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signInWithGitHub } from "@/app/login/actions";

interface LoginDialogProps {
  trigger?: React.ReactNode;
  message?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LoginDialog({ trigger, message, defaultOpen, onOpenChange }: LoginDialogProps) {
  const currentPath = usePathname();

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
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </DialogHeader>
        <form className="space-y-4">
          <input type="hidden" name="returnPath" value={currentPath} />
          <Button
            formAction={signInWithGitHub}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Github className="w-5 h-5" />
            Zaloguj się przez GitHub
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
