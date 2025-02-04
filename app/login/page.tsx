import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Github, Lock } from 'lucide-react'
import { signInWithGitHub } from './actions'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <CardWrapper
        className="max-w-96"
        headerIcon={<Lock width={5} height={5} />}
        title="Zaloguj się"
      >
        <form className="space-y-4">
          <input type="hidden" name="returnPath" value="/" />
          <Button
            formAction={signInWithGitHub}
            className="flex w-full items-center gap-2"
            variant="outline"
          >
            <Github className="h-5 w-5" />
            Zaloguj się przez GitHub
          </Button>
        </form>
      </CardWrapper>
    </div>
  )
}
