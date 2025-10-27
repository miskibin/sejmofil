import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Błąd uwierzytelniania | Sejmofil',
  description: 'Wystąpił problem podczas logowania. Spróbuj ponownie.',
}

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <CardWrapper
        className="max-w-md"
        headerIcon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        title="Błąd uwierzytelniania"
      >
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Wystąpił problem podczas logowania. Możliwe przyczyny:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Link uwierzytelniający wygasł</li>
            <li>Link został już użyty</li>
            <li>Problem z konfiguracją OAuth</li>
          </ul>
          <div className="flex justify-center pt-4">
            <Button asChild>
              <Link href="/login">Spróbuj ponownie</Link>
            </Button>
          </div>
        </div>
      </CardWrapper>
    </div>
  )
}
