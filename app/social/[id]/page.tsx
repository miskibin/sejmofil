'use client'
import { StatementReactions } from '@/components/statement-reactions'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { VotingList } from '@/components/voting-list'
import Image from 'next/image'
import { DiscussionEntries } from '../../proceedings/[number]/[date]/[id]/components/discussion-entries'
import { article, mockSpeakerClubs, mockStatements, mockVotings } from './mock-data'
import ReactMarkdown from 'react-markdown'

export default function SocialStylePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/5 to-background">
      {/* Title & Hero Section */}
      <div className="relative">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="mb-2 text-4xl font-bold">
          Polska prezydencja w Radzie UE pod znakiem bezpieczeństwa. Opozycja krytykuje brak konkretów
          </h1>
          <p className="text-xl text-muted-foreground">
          8 stycznia 2025, Sejm RP
          </p>
        </div>

        {/* Hero Image with gradient overlay */}
        <div className="relative h-[50vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-muted/10" />
          <Image
            src="https://db.msulawiak.pl/storage/v1/object/public/flux/cudzoziemcy.png"
            alt="Header"
            fill
            className="rounded-[2rem]"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative -mt-32 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="space-y-6 lg:col-span-2">
            <CardWrapper
              className="bg-background/95 shadow-xl backdrop-blur-sm"
              title="Szczegóły"
              subtitle="Analiza proponowanych zmian"
            >
              <article className="prose prose-sm max-w-none">
                <ReactMarkdown>
                {article}
               </ReactMarkdown>
              </article>
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <StatementReactions statementId={1} />
                <span className="text-sm text-muted-foreground">
                  15 stycznia 2024
                </span>
              </div>
            </CardWrapper>

            {/* Discussion Section */}
            <CardWrapper title="Dyskusja" className="bg-background">
              <DiscussionEntries
                statements={mockStatements}
                speakerClubs={mockSpeakerClubs}
                proceedingNumber={1}
                proceedingDate="2024-01-01"
                initialMode="featured"
              />
            </CardWrapper>
          </div>

          {/* Sidebar with fixed positioning */}
          <div className="lg:block">
            <div className="space-y-6 lg:sticky lg:top-24">
              {' '}
              {/* Adjust top value based on your navbar height */}
              <CardWrapper
                title="Głosowania"
                className="bg-background shadow-lg"
                subtitle="Przebieg głosowań"
              >
                <VotingList votings={mockVotings} />
              </CardWrapper>
              <CardWrapper
                title="Statystyki debaty"
                className="bg-background"
                subtitle="Podsumowanie"
              >
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Czas debaty
                    </span>
                    <span className="font-medium">3h 45min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Wypowiedzi
                    </span>
                    <span className="font-medium">{mockStatements.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Głosowania
                    </span>
                    <span className="font-medium">{mockVotings.length}</span>
                  </div>
                </div>
              </CardWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* Add a subtle gradient footer */}
      <div className="mt-16 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
