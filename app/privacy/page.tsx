'use client'

import { SOCIAL_LINKS } from '@/lib/config/links'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Polityka Prywatności Sejmofil
          </CardTitle>
          <CardDescription>Ostatnia aktualizacja: 26.01.2024</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              1. Informacje Ogólne
            </h2>
            <p className="text-muted-foreground">
              Niniejsza Polityka Prywatności określa zasady przetwarzania i
              ochrony danych użytkowników serwisu Sejmofil. Administratorem
              danych jest właściciel projektu niekomercyjnego Sejmofil. Projekt
              ma charakter non-profit i służy celom edukacyjnym oraz
              informacyjnym.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Zbierane Dane</h2>
            <p className="text-muted-foreground mb-4">
              Zbieramy następujące dane:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Podstawowe dane użytkownika przy logowaniu (email, nazwa
                użytkownika)
              </li>
              <li>Reakcje użytkowników na wypowiedzi polityków</li>
              <li>
                Anonimowe statystyki użytkowania strony (przez Umami Analytics)
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Cel Przetwarzania
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Umożliwienie interakcji z treścią (reakcje na wypowiedzi)</li>
              <li>Poprawa funkcjonalności serwisu</li>
              <li>
                Analiza sposobu korzystania z serwisu (anonimowe statystyki)
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Twoje Prawa</h2>
            <p className="text-muted-foreground mb-4">Masz prawo do:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Dostępu do swoich danych</li>
              <li>Usunięcia konta i powiązanych danych</li>
              <li>Eksportu swoich danych</li>
              <li>Wycofania zgody na przetwarzanie</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Kontakt</h2>
            <p className="text-muted-foreground">
              W sprawach związanych z ochroną danych osobowych możesz
              kontaktować się z nami przez email: {SOCIAL_LINKS.CONTACT_EMAIL}{' '}
              lub Discord: {SOCIAL_LINKS.DISCORD}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
