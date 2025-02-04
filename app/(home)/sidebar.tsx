import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Sidebar() {
  return (
    <div className="w-80 space-y-12 text-card-foreground/80">
      {/* Poznaj Sejmofil */}
      <div className="space-y-2">
        <h2 className="text-lg text-muted-foreground">Poznaj Sejmofil</h2>
        <div className="space-y-4">
          <h3 className="text-3xl font-semibold leading-tight">
            Komentuj poczynania{' '}
            <span className="text-primary">polskich polityków</span>
          </h3>
          <Button className="rounded-full">
            Zaloguj się
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        <h2 className="text-lg text-muted-foreground">Popularne Tematy</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'Gospodarka',
            'Edukacja',
            'Służba Zdrowia',
            'Mieszkalnictwo',
            'Polityka Społeczna',
            'Rynek Pracy',
            'Imigracja',
            'Unia Europejska',
          ].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-card rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href="#"
          className="block text-sm text-primary hover:text-primary/80"
        >
          Zobacz więcej tematów
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg text-muted-foreground">
            Najbliższe obrady sejmu
          </h2>
          <p className="text-sm">
            za <span className="text-primary">16 godz 28 min</span>
          </p>
        </div>
      </div>

      {/* Did you know */}
      <div className="space-y-6">
        <h2 className="text-lg text-muted-foreground">Czy Wiesz, że?</h2>
        <div className="space-y-6">
          {[
            { name: 'Donald Tusk', stat: 'Przekłną 2 razy' },
            {
              name: 'Andrzej Duda',
              stat: 'Ma 40% Frekwencję na Posiedzeniach',
            },
            { name: 'Sasin', stat: 'Jakaś statystyka 20' },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
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

      {/* Quotes */}
      <div className="space-y-6">
        <h2 className="text-lg text-muted-foreground">Cytaty</h2>
        <div className="space-y-6">
          {[
            {
              author: 'Abraham Braun',
              quote:
                'Web Design Trends 2025 worth knowing as a website designer or developer. While AI is popular for graphics design, I still prefer website designs that are hand crafted and designed',
            },
            {
              author: 'Abraham Braun',
              quote:
                "If you haven't tried creating staggered animations in GSAP",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{item.author[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {item.author}
                </div>
                <p className="text-base text-card-foreground/60 line-clamp-3">
                  {item.quote}
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
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full justify-between">
          Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
