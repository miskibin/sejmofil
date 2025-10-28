import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProceedingDates } from '@/lib/queries/proceeding'
import {
  getNextProceedingDate,
  getTimeUntilNextProceeding,
} from '@/lib/utils'
import { getAllEntities } from '@/lib/queries/topic'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SidebarAuthSection } from '@/components/sidebar-auth-section'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import DidYouKnow from '@/components/did-you-know'
import PoliticianQuotes from '@/components/politician-quotes'

export default async function Sidebar() {
  // Fetch all required data
  const proceedings = await getProceedingDates()
  const nextDate = getNextProceedingDate(proceedings)
  const timeUntil = getTimeUntilNextProceeding(nextDate)

  const allEntities = await getAllEntities(['Topic', 'Organization'], 10)
  const topEntities = allEntities.slice(0, 5)

  return (
    <div className="w-80 space-y-12 text-card-foreground/80">
      {/* Poznaj Sejmofil */}
      <div className="space-y-2">
        <SidebarAuthSection />
      </div>

      {/* Updated Topics section with real data */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Popularne Tematy i Organizacje</h2>
        <div className="flex flex-wrap gap-2">
          {topEntities.map((entity) => (
            <Link
              key={entity.name}
              href={`/entities/${encodeURIComponent(entity.name)}`}
              className="px-4 py-2 bg-card text-sm hover:bg-primary/10 transition-all duration-200 cursor-pointer rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-sm"
            >
              {entity.name}
            </Link>
          ))}
        </div>
        <Link
          href="/entities"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Zobacz więcej
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Updated Upcoming Sessions with real data */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg text-muted-foreground ">
            Najbliższe obrady sejmu
          </h2>
          <p className="">
            {nextDate ? (
              timeUntil === '0' ? (
                'Obrady trwają'
              ) : (
                <>
                  za{' '}
                  <span className="text-primary text-2xl  font-bold">{timeUntil}</span>
                </>
              )
            ) : (
              'Brak zaplanowanych obrad'
            )}
          </p>
        </div>
      </div>

      {/* Updated Did you know section with real data */}
      <div>
        <DidYouKnow />
      </div>

      {/* Politician Quotes section */}
      <PoliticianQuotes />

      {/* Dashboard CTA */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Chcesz więcej <span className="text-primary">Statystyk?</span>
        </h2>
        <Link href="/dashboard">
          <Button className="w-full bg-primary hover:bg-primary/90 mt-3 text-primary-foreground  justify-between">
            Przejdź do panelu
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
