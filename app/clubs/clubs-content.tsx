'use client'

import { useState } from 'react'
import { ClubWithStats, ClubInfluence, ClubDemographics, TopicCount } from '@/lib/queries/clubs'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Users, FileText, Mail, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ParliamentChart } from './components/parliament-chart'
import { GenderChart } from './components/gender-chart'
import { TopicChart } from './components/topic-chart'

interface ClubsContentProps {
  clubs: ClubWithStats[]
  influenceScores: ClubInfluence[]
  allDemographics: (ClubDemographics & { clubId: string })[]
  allTopics: { clubId: string; topics: TopicCount[] }[]
}

export function ClubsContent({ clubs, influenceScores, allDemographics, allTopics }: ClubsContentProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '')

  const selectedClub = clubs.find((c) => c.id === selectedClubId)
  const selectedDemographics = allDemographics.find((d) => d.clubId === selectedClubId)
  const selectedTopicsData = allTopics.find((t) => t.clubId === selectedClubId)

  return (
    <div className="space-y-6">
      {/* Overall Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardWrapper
          title="Kluby"
          subtitle="Wszystkie kluby parlamentarne"
          variant="inverted"
          headerIcon={<Users className="h-5 w-5" />}
        >
          <p className="text-4xl font-bold">{clubs.length}</p>
        </CardWrapper>

        <CardWrapper
          title="Posłowie"
          subtitle="Łączna liczba aktywnych posłów"
          variant="inverted"
          headerIcon={<Users className="h-5 w-5" />}
        >
          <p className="text-4xl font-bold">
            {clubs.reduce((sum, club) => sum + club.activeMembers, 0)}
          </p>
        </CardWrapper>

        <CardWrapper
          title="Projekty Ustaw"
          subtitle="Wszystkie autorskie projekty"
          variant="inverted"
          headerIcon={<FileText className="h-5 w-5" />}
        >
          <p className="text-4xl font-bold">
            {clubs.reduce((sum, club) => sum + club.bills, 0)}
          </p>
        </CardWrapper>

        <CardWrapper
          title="Najaktywniejszy"
          subtitle={influenceScores[0]?.name.split(' ').pop() || '-'}
          variant="inverted"
          headerIcon={<FileText className="h-5 w-5" />}
        >
          <p className="text-4xl font-bold">{influenceScores[0]?.billsAuthored || 0}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">projektów ustaw</p>
        </CardWrapper>
      </div>

      {/* Parliament Composition */}
      <CardWrapper
        title="Skład Sejmu"
        subtitle="Rozkład mandatów według klubów parlamentarnych"
      >
        <ParliamentChart clubs={clubs} />
      </CardWrapper>

      {/* Club Selection Buttons */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Wybierz Klub</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {clubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelectedClubId(club.id)}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                selectedClubId === club.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-primary/10 border-border/50 hover:border-primary/30'
              }`}
            >
              <div className="font-bold">{club.id}</div>
              <div className="text-xs opacity-70">{club.activeMembers} posłów</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Club Details */}
      {selectedClub && (
        <div className="space-y-6">
          {/* Club Header */}
          <CardWrapper
            title="Informacje"
            subtitle={selectedClub.name}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Liczba posłów</div>
                <div className="text-3xl font-bold text-primary">{selectedClub.activeMembers}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Projekty ustaw</div>
                <div className="text-3xl font-bold text-primary">{selectedClub.bills}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Wskaźnik wpływu</div>
                <div className="text-3xl font-bold text-primary">
                  {influenceScores.find(i => i.id === selectedClub.id)?.influenceScore.toFixed(0) || '0'}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {(selectedClub.email || selectedClub.phone || selectedClub.fax) && (
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="text-sm font-semibold text-muted-foreground mb-3">Kontakt</div>
                {selectedClub.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${selectedClub.email}`} className="hover:text-primary">
                      {selectedClub.email}
                    </a>
                  </div>
                )}
                {selectedClub.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{selectedClub.phone}</span>
                  </div>
                )}
                {selectedClub.fax && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Fax: {selectedClub.fax}</span>
                  </div>
                )}
              </div>
            )}
          </CardWrapper>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {selectedDemographics && (
              <CardWrapper
                title="Demografia"
                subtitle="Rozkład płci w klubie"
              >
                <GenderChart demographics={selectedDemographics} />
              </CardWrapper>
            )}

            {selectedTopicsData && selectedTopicsData.topics.length > 0 && (
              <CardWrapper
                title="Priorytetowe Zagadnienia"
                subtitle="Top 15 obszarów legislacyjnych"
              >
                <TopicChart topics={selectedTopicsData.topics} clubName={selectedClub.name} />
              </CardWrapper>
            )}
          </div>
        </div>
      )}

      {/* All Clubs Comparison Table */}
      <CardWrapper
        title="Porównanie"
        subtitle="Statystyki wszystkich klubów parlamentarnych"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="text-left p-3 font-medium">Klub</th>
                <th className="text-right p-3 font-medium">Posłowie</th>
                <th className="text-right p-3 font-medium">Projekty</th>
                <th className="text-right p-3 font-medium">Wpływ</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => {
                const influence = influenceScores.find(i => i.id === club.id)
                return (
                  <tr
                    key={club.id}
                    onClick={() => setSelectedClubId(club.id)}
                    className={`border-b cursor-pointer transition-colors ${
                      selectedClubId === club.id ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{club.id}</Badge>
                        <span className="text-sm font-medium hidden sm:inline">
                          {club.name.replace('Klub Parlamentarny ', '')}
                        </span>
                      </div>
                    </td>
                    <td className="text-right p-3 font-semibold">{club.activeMembers}</td>
                    <td className="text-right p-3">{club.bills}</td>
                    <td className="text-right p-3 text-primary font-semibold">
                      {influence?.influenceScore.toFixed(0) || '0'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardWrapper>
    </div>
  )
}
