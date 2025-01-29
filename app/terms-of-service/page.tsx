"use client";

import { SOCIAL_LINKS } from '@/lib/config/links'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Regulamin Serwisu Sejmofil
          </CardTitle>
          <CardDescription>
            Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Postanowienia Ogólne</h2>
            <p className="text-muted-foreground">
              Sejmofil jest niekomercyjnym serwisem internetowym służącym do analizy 
              i prezentacji danych z posiedzeń Sejmu RP. Korzystanie z serwisu jest bezpłatne 
              i oznacza akceptację niniejszego regulaminu.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Zasady Korzystania</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Nie nadużywaj systemu reakcji</li>
              <li>Szanuj innych użytkowników</li>
              <li>Nie wykorzystuj danych w sposób niezgodny z prawem</li>
              <li>Nie próbuj zakłócać działania serwisu</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Reakcje i Interakcje</h2>
            <p className="text-muted-foreground">
              System reakcji służy do wyrażania opinii na temat wypowiedzi posłów. 
              Każdy użytkownik może dodać jedną reakcję do danej wypowiedzi. 
              Nadużywanie systemu reakcji może skutkować zablokowaniem konta.
            </p>
          </section>

          <Separator />

          {/* Add more sections as needed */}
        </CardContent>
      </Card>
    </div>
  )
}
