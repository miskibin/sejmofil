"use client";
import Image from "next/image";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { StatementReactions } from "@/components/statement-reactions";
import { VotingList } from "@/components/voting-list";
import { DiscussionEntries } from "../../proceedings/[number]/[date]/[id]/components/discussion-entries";
import { mockVotings, mockStatements, mockSpeakerClubs } from "./mock-data";

export default function SocialStylePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/5 to-background">
      {/* Title & Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <h1 className="text-4xl font-bold mb-2">
            Reforma systemu azylowego w Polsce
          </h1>
          <p className="text-xl text-muted-foreground">
            Analiza kluczowej debaty parlamentarnej
          </p>
        </div>

        {/* Hero Image with gradient overlay */}
        <div className="relative w-full h-[50vh]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-muted/10" />
          <Image
            src="https://db.msulawiak.pl/storage/v1/object/public/flux/cudzoziemcy.png"
            alt="Header"
            fill
            className="object-cover rounded-[2rem]"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-32 relative">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <CardWrapper
              className="bg-background/95 backdrop-blur-sm shadow-xl"
              title="Szczegóły"
              subtitle="Analiza proponowanych zmian"
            >
              <article className="prose prose-sm max-w-none dark:prose-invert">
                <p className="lead text-lg font-medium text-foreground">
                  Sejm rozpoczął prace nad kompleksową reformą systemu azylowego, która ma na celu fundamentalną przebudowę procesu przyjmowania i rozpatrywania wniosków o ochronę międzynarodową w Polsce.
                </p>
                <p>
                  Proponowane zmiany zakładają utworzenie specjalnej komisji weryfikacyjnej, wprowadzenie nowych procedur przyspieszonych oraz modernizację systemu identyfikacji. Reforma ma odpowiedzieć na rosnące wyzwania migracyjne i dostosować polskie prawo do standardów europejskich.
                </p>
                <p>
                  Kluczowe elementy reformy obejmują:
                </p>
                <ul>
                  <li>Utworzenie Centrum Procedur Azylowych z oddziałami w każdym województwie</li>
                  <li>Wprowadzenie 60-dniowego terminu na rozpatrzenie wniosku w trybie przyspieszonym</li>
                  <li>Cyfryzację procesu składania i weryfikacji dokumentów</li>
                  <li>Wzmocnienie współpracy międzynarodowej w zakresie weryfikacji tożsamości</li>
                </ul>
                <p>
                  Dyskusja w Sejmie koncentruje się głównie wokół kwestii bezpieczeństwa, efektywności procedur oraz zgodności proponowanych rozwiązań z prawem międzynarodowym.
                </p>
              </article>
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
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
            <div className="space-y-6 lg:sticky lg:top-24"> {/* Adjust top value based on your navbar height */}
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
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Czas debaty</span>
                    <span className="font-medium">3h 45min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wypowiedzi</span>
                    <span className="font-medium">{mockStatements.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Głosowania</span>
                    <span className="font-medium">{mockVotings.length}</span>
                  </div>
                </div>
              </CardWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* Add a subtle gradient footer */}
      <div className="h-32 bg-gradient-to-t from-background to-transparent mt-16" />
    </div>
  );
}
