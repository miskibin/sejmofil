import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-8">
      <CardWrapper
        title="Błąd 404"
        subtitle="Strona nie została znaleziona"
        showSource={false}
        showGradient={false}
        className="max-w-lg"
        headerIcon={<AlertCircle className="h-6 w-6 text-primary" />}
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <Image
            src="/empty.svg"
            alt="404"
            className="m-4"
            width={300}
            height={300}
          />
          <p className="text-muted-foreground">
            Przepraszamy, ale strona której szukasz nie istnieje lub została
            przeniesiona.
          </p>

          <Button asChild>
            <Link href="/">Wróć do strony głównej</Link>
          </Button>
        </div>
      </CardWrapper>
    </main>
  )
}
