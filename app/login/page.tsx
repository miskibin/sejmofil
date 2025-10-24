import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Github, Lock } from 'lucide-react'
import {
  signInWithGitHub,
  signInWithGoogle,
  signInWithFacebook,
} from './actions'
import { FaFacebook, FaGoogle } from 'react-icons/fa'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <CardWrapper
        className="max-w-96"
        headerIcon={<Lock width={5} height={5} />}
        title="Zaloguj się"
      >
        <form className="space-y-4">
          <input type="hidden" name="redirectTo" value="/" />

          <Button
            formAction={signInWithGitHub}
            className="flex w-full items-center gap-2 bg-[#24292e] hover:bg-[#1a1e22] text-white"
            variant="default"
          >
            <Github className="h-5 w-5" />
            Zaloguj się przez GitHub
          </Button>

          <Button
            formAction={signInWithGoogle}
            className="flex w-full items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
            variant="outline"
          >
            <FaGoogle className="h-4 w-4 text-red-500" />
            Zaloguj się przez Google
          </Button>

          <Button
            formAction={signInWithFacebook}
            className="flex w-full items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white"
            variant="default"
          >
            <FaFacebook className="h-5 w-5" />
            Zaloguj się przez Facebook
          </Button>
        </form>
      </CardWrapper>
    </div>
  )
}
