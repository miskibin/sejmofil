import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getPersonWithMostAbsents,
  getPersonWithMostInterruptions,
  getPersonWithMostStatements,
} from '@/lib/queries/person'
import { getProceedingDates } from '@/lib/queries/proceeding'
import {
  getNextProceedingDate,
  getTimeUntilNextProceeding,
  truncateText,
} from '@/lib/utils'
import { getLatestCitizations } from '@/lib/supabase/getLatestCitizations'
import { getTopDiscussedTopics } from '@/lib/supabase/getTopDiscussedTopics'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SidebarAuthSection } from '@/components/sidebar-auth-section'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'

export default async function Sidebar() {

  // Fetch all required data
  const proceedings = await getProceedingDates()
  const nextDate = getNextProceedingDate(proceedings)
  const timeUntil = getTimeUntilNextProceeding(nextDate)

  const mostInterruptions = await getPersonWithMostAbsents() // TODO WAIT FOR DB
  const mostAbsents = await getPersonWithMostAbsents()
  const mostStatements = await getPersonWithMostStatements()
  const citations = await getLatestCitizations(2)
  const topTopics = await getTopDiscussedTopics(8)

  const politicians = [
    {
      name: mostAbsents.name,
      stat: `Nieobecności: ${mostAbsents.count}`,
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostAbsents.id}.jpeg`,
    },
    {
      name: mostStatements.name,
      stat: `Wypowiedzi: ${mostStatements.count}`,
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostStatements.id}.jpeg`,
    },
    {
      name: mostInterruptions.name,
      stat: `Przerwał/a: ${mostInterruptions.count} razy`,
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostInterruptions.id}.jpeg`,
    },
  ]

  return (
    <div className="w-80 space-y-12 text-card-foreground/80">
      {/* Poznaj Sejmofil */}
      <div className="space-y-2">
        <h2 className="text-lg text-muted-foreground">Poznaj nas</h2>
        <SidebarAuthSection />
      </div>

      {/* Updated Topics section with real data */}
      <div className="space-y-4">
        <h2 className="text-lg text-muted-foreground">Popularne Tematy</h2>
        <div className="flex flex-wrap gap-2">
          {topTopics.map((topic) => (
            <span
              key={topic.uuid}
              className="px-4 py-2 bg-card rounded-full text-sm"
            >
              {topic.topic}
            </span>
          ))}
        </div>
        <Link
          href="/topics"
          className="block text-sm text-primary hover:text-primary/80"
        >
          Zobacz więcej tematów
        </Link>
      </div>

      {/* Updated Upcoming Sessions with real data */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg text-muted-foreground">
            Najbliższe obrady sejmu
          </h2>
          <p className="text-sm">
            {nextDate ? (
              timeUntil === '0' ? (
                'Obrady trwają'
              ) : (
                <>
                  za <span className="text-primary">{timeUntil}</span>
                </>
              )
            ) : (
              'Brak zaplanowanych obrad'
            )}
          </p>
        </div>
      </div>

      {/* Updated Did you know section with real data */}
      <div className="space-y-6">
        <h2 className="text-lg text-muted-foreground">Czy Wiesz, że?</h2>
        <div className="space-y-6">
          {politicians.map((item) => (
            <div key={item.name} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={item.image} />
                <AvatarFallback>{item.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">{item.name}</div>
                <div className="text-base text-card-foreground/60">
                  {item.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Updated Quotes section with real data */}
      <div className="space-y-6">
        <h2 className="text-lg text-muted-foreground">Cytaty</h2>
        <div className="space-y-6">
          {citations.map((citation, index) => (
            <div key={index} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={`https://api.sejm.gov.pl/sejm/term10/MP/${citation.statement_id}/photo`}
                />
                <AvatarFallback>{citation.speaker_name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {citation.speaker_name}
                </div>
                <p className="text-base text-card-foreground/60 line-clamp-3">
                  {truncateText(citation.citation, 100)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard CTA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Chcesz więcej <span className="text-primary">Statystyk?</span>
        </h2>
        <Link href="/dashboard">
          <Button className="w-full bg-primary hover:bg-primary/90 mt-3 text-primary-foreground rounded-full justify-between">
            Przejdź do panelu
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
