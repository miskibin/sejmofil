'use client'

import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="container mx-auto flex max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-8">
      <CardWrapper
        subtitle="Coś poszło nie tak"
        showSource={false}
        showGradient={false}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <Image
            src="/empty.svg"
            alt="Error"
            className="m-4"
            width={300}
            height={300}
          />

          <div className="w-full space-y-3 break-words">
            <p className="text-muted-foreground">
              Przepraszamy! Napotkaliśmy nieoczekiwany błąd podczas ładowania
              aplikacji.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="w-full text-left">
                <summary className="cursor-pointer rounded-md  px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
                  Szczegóły błędu (tylko dla deweloperów)
                </summary>
                <pre className="mt-2 overflow-auto rounded-md p-3 text-left text-xs">
                  {error.message && `Error: ${error.message}\n`}
                  {error.digest && `Digest: ${error.digest}`}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            {error.digest && (
              <p className="text-xs text-muted-foreground">
                ID błędu:{' '}
                <code className="rounded px-2 py-1">{error.digest}</code>
              </p>
            )}
          </div>
        </div>
      </CardWrapper>
    </main>
  )
}
