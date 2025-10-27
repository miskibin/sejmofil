'use client''use client''use client'



import { useState } from 'react'

import { ClubWithStats, ClubInfluence, ClubDemographics, TopicCount } from '@/lib/queries/clubs'

import { CardWrapper } from '@/components/ui/card-wrapper'import { useState } from 'react'import { useState } from 'react'

import { ParliamentChart } from './parliament-chart'

import { GenderDistribution } from './gender-distribution'import { ClubWithStats, ClubInfluence, ClubDemographics, TopicCount } from '@/lib/queries/clubs'import { ClubWithStats, ClubInfluence, ClubDemographics, TopicCount } from '@/lib/queries/clubs'

import { TopicDistribution } from './topic-distribution'

import { Users, FileText, Mail, Phone, Fax } from 'lucide-react'import { CardWrapper } from '@/components/ui/card-wrapper'import { CardWrapper } from '@/components/ui/card-wrapper'

import { Badge } from '@/components/ui/badge'

import { ParliamentChart } from './parliament-chart'import { ParliamentChart } from './parliament-chart'

interface ClubsClientProps {

  clubs: ClubWithStats[]import { GenderDistribution } from './gender-distribution'import { InfluenceScore } from './influence-score'

  influenceScores: ClubInfluence[]

  allDemographics: (ClubDemographics & { clubId: string })[]import { TopicDistribution } from './topic-distribution'import { GenderDistribution } from './gender-distribution'

  allTopics: { clubId: string; topics: TopicCount[] }[]

}import { Users, FileText, Mail, Phone, Fax } from 'lucide-react'import { TopicDistribution } from './topic-distribution'



export function ClubsClient({ clubs, influenceScores, allDemographics, allTopics }: ClubsClientProps) {import { Badge } from '@/components/ui/badge'import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '')

import { Users, FileText, Mail, Phone } from 'lucide-react'

  const selectedClub = clubs.find((c) => c.id === selectedClubId)

  const selectedDemographics = allDemographics.find((d) => d.clubId === selectedClubId)interface ClubsClientProps {import { Badge } from '@/components/ui/badge'

  const selectedTopicsData = allTopics.find((t) => t.clubId === selectedClubId)

  clubs: ClubWithStats[]

  return (

    <div className="space-y-6">  influenceScores: ClubInfluence[]interface ClubsClientProps {

      {/* Overall Statistics Grid */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">  allDemographics: (ClubDemographics & { clubId: string })[]  clubs: ClubWithStats[]

        <CardWrapper

          title="Kluby"  allTopics: { clubId: string; topics: TopicCount[] }[]  influenceScores: ClubInfluence[]

          subtitle="Wszystkie kluby parlamentarne"

          variant="inverted"}  selectedClubData?: {

          headerIcon={<Users className="h-5 w-5" />}

        >    demographics: ClubDemographics | null

          <p className="text-4xl font-bold">{clubs.length}</p>

        </CardWrapper>export function ClubsClient({ clubs, influenceScores, allDemographics, allTopics }: ClubsClientProps) {    topics: TopicCount[]



        <CardWrapper  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '')  }

          title="Posłowie"

          subtitle="Łączna liczba aktywnych posłów"}

          variant="inverted"

          headerIcon={<Users className="h-5 w-5" />}  const selectedClub = clubs.find((c) => c.id === selectedClubId)

        >

          <p className="text-4xl font-bold">  const selectedDemographics = allDemographics.find((d) => d.clubId === selectedClubId)export function ClubsClient({ clubs, influenceScores, selectedClubData }: ClubsClientProps) {

            {clubs.reduce((sum, club) => sum + club.activeMembers, 0)}

          </p>  const selectedTopicsData = allTopics.find((t) => t.clubId === selectedClubId)  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '')

        </CardWrapper>



        <CardWrapper

          title="Projekty Ustaw"  return (  const selectedClub = clubs.find((c) => c.id === selectedClubId)

          subtitle="Wszystkie autorskie projekty"

          variant="inverted"    <div className="space-y-6">

          headerIcon={<FileText className="h-5 w-5" />}

        >      {/* Overall Statistics Grid */}  return (

          <p className="text-4xl font-bold">

            {clubs.reduce((sum, club) => sum + club.bills, 0)}      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">    <div className="space-y-6">

          </p>

        </CardWrapper>        <CardWrapper      {/* Overview Section */}



        <CardWrapper          title="Kluby"      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          title="Najaktywniejszy"

          subtitle={influenceScores[0]?.name.split(' ').pop() || '-'}          subtitle="Wszystkie kluby parlamentarne"        <Card>

          variant="inverted"

          headerIcon={<FileText className="h-5 w-5" />}          variant="inverted"          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

        >

          <p className="text-4xl font-bold">{influenceScores[0]?.billsAuthored || 0}</p>          headerIcon={<Users className="h-5 w-5" />}            <CardTitle className="text-sm font-medium">Wszystkie Kluby</CardTitle>

          <p className="text-xs text-primary-foreground/70 mt-1">projektów ustaw</p>

        </CardWrapper>        >            <Users className="h-4 w-4 text-muted-foreground" />

      </div>

          <p className="text-4xl font-bold">{clubs.length}</p>          </CardHeader>

      {/* Parliament Composition */}

      <CardWrapper        </CardWrapper>          <CardContent>

        title="Skład Sejmu"

        subtitle="Rozkład mandatów według klubów parlamentarnych"            <div className="text-2xl font-bold">{clubs.length}</div>

      >

        <ParliamentChart clubs={clubs} />        <CardWrapper            <p className="text-xs text-muted-foreground">Zarejestrowanych klubów parlamentarnych</p>

      </CardWrapper>

          title="Posłowie"          </CardContent>

      {/* Club Selection Buttons */}

      <div className="space-y-4">          subtitle="Łączna liczba aktywnych posłów"        </Card>

        <h2 className="text-2xl font-semibold">Wybierz Klub</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">          variant="inverted"

          {clubs.map((club) => (

            <button          headerIcon={<Users className="h-5 w-5" />}        <Card>

              key={club.id}

              onClick={() => setSelectedClubId(club.id)}        >          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${

                selectedClubId === club.id          <p className="text-4xl font-bold">            <CardTitle className="text-sm font-medium">Posłowie</CardTitle>

                  ? 'bg-primary text-primary-foreground border-primary'

                  : 'bg-card hover:bg-primary/10 border-border/50 hover:border-primary/30'            {clubs.reduce((sum, club) => sum + club.activeMembers, 0)}            <Users className="h-4 w-4 text-muted-foreground" />

              }`}

            >          </p>          </CardHeader>

              <div className="font-bold">{club.id}</div>

              <div className="text-xs opacity-70">{club.activeMembers} posłów</div>        </CardWrapper>          <CardContent>

            </button>

          ))}            <div className="text-2xl font-bold">

        </div>

      </div>        <CardWrapper              {clubs.reduce((sum, club) => sum + club.activeMembers, 0)}



      {/* Selected Club Details */}          title="Projekty Ustaw"            </div>

      {selectedClub && (

        <div className="space-y-6">          subtitle="Wszystkie autorskie projekty"            <p className="text-xs text-muted-foreground">Aktywnych posłów w klubach</p>

          {/* Club Header */}

          <CardWrapper          variant="inverted"          </CardContent>

            title="Informacje"

            subtitle={selectedClub.name}          headerIcon={<FileText className="h-5 w-5" />}        </Card>

          >

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">        >

              <div>

                <div className="text-sm text-muted-foreground mb-1">Liczba posłów</div>          <p className="text-4xl font-bold">        <Card>

                <div className="text-3xl font-bold text-primary">{selectedClub.activeMembers}</div>

              </div>            {clubs.reduce((sum, club) => sum + club.bills, 0)}          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <div>

                <div className="text-sm text-muted-foreground mb-1">Projekty ustaw</div>          </p>            <CardTitle className="text-sm font-medium">Ustawy</CardTitle>

                <div className="text-3xl font-bold text-primary">{selectedClub.bills}</div>

              </div>        </CardWrapper>            <FileText className="h-4 w-4 text-muted-foreground" />

              <div>

                <div className="text-sm text-muted-foreground mb-1">Wskaźnik wpływu</div>          </CardHeader>

                <div className="text-3xl font-bold text-primary">

                  {influenceScores.find(i => i.id === selectedClub.id)?.influenceScore.toFixed(0) || '0'}        <CardWrapper          <CardContent>

                </div>

              </div>          title="Najaktywniejszy"            <div className="text-2xl font-bold">

              <div>

                <div className="text-sm text-muted-foreground mb-1">Łączne głosy</div>          subtitle={influenceScores[0]?.name.split(' ').pop() || '-'}              {clubs.reduce((sum, club) => sum + club.bills, 0)}

                <div className="text-3xl font-bold text-primary">

                  {selectedClub.totalVotes.toLocaleString('pl-PL')}          variant="inverted"            </div>

                </div>

              </div>          headerIcon={<FileText className="h-5 w-5" />}            <p className="text-xs text-muted-foreground">Wszystkich projektów ustaw</p>

            </div>

        >          </CardContent>

            {/* Contact Information */}

            {(selectedClub.email || selectedClub.phone || selectedClub.fax) && (          <p className="text-4xl font-bold">{influenceScores[0]?.billsAuthored || 0}</p>        </Card>

              <div className="mt-6 pt-6 border-t space-y-2">

                <div className="text-sm font-semibold text-muted-foreground mb-3">Kontakt</div>          <p className="text-xs text-primary-foreground/70 mt-1">projektów ustaw</p>

                {selectedClub.email && (

                  <div className="flex items-center gap-2 text-sm">        </CardWrapper>        <Card>

                    <Mail className="h-4 w-4 text-primary" />

                    <a href={`mailto:${selectedClub.email}`} className="hover:text-primary">      </div>          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                      {selectedClub.email}

                    </a>            <CardTitle className="text-sm font-medium">Tematy</CardTitle>

                  </div>

                )}      {/* Parliament Composition */}            <Target className="h-4 w-4 text-muted-foreground" />

                {selectedClub.phone && (

                  <div className="flex items-center gap-2 text-sm">      <CardWrapper          </CardHeader>

                    <Phone className="h-4 w-4 text-primary" />

                    <span>{selectedClub.phone}</span>        title="Skład Sejmu"          <CardContent>

                  </div>

                )}        subtitle="Rozkład mandatów według klubów parlamentarnych"            <div className="text-2xl font-bold">

                {selectedClub.fax && (

                  <div className="flex items-center gap-2 text-sm">      >              {Math.max(...clubs.map((club) => club.topics))}

                    <Fax className="h-4 w-4 text-primary" />

                    <span>{selectedClub.fax}</span>        <ParliamentChart clubs={clubs} />            </div>

                  </div>

                )}      </CardWrapper>            <p className="text-xs text-muted-foreground">Najszerszy zakres tematów</p>

              </div>

            )}          </CardContent>

          </CardWrapper>

      {/* Club Selection Buttons */}        </Card>

          {/* Charts Grid */}

          <div className="grid gap-6 md:grid-cols-2">      <div className="space-y-4">      </div>

            {selectedDemographics && (

              <CardWrapper        <h2 className="text-2xl font-semibold">Wybierz Klub</h2>

                title="Demografia"

                subtitle="Rozkład płci w klubie"        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">      {/* Parliament Chart */}

              >

                <GenderDistribution demographics={selectedDemographics} />          {clubs.map((club) => (      <Card>

              </CardWrapper>

            )}            <button        <CardHeader>



            {selectedTopicsData && selectedTopicsData.topics.length > 0 && (              key={club.id}          <CardTitle>Rozkład Mandatów w Sejmie</CardTitle>

              <CardWrapper

                title="Priorytetowe Zagadnienia"              onClick={() => setSelectedClubId(club.id)}        </CardHeader>

                subtitle="Top 15 obszarów legislacyjnych"

              >              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${        <CardContent>

                <TopicDistribution topics={selectedTopicsData.topics} clubName={selectedClub.name} />

              </CardWrapper>                selectedClubId === club.id          <ParliamentChart clubs={clubs} />

            )}

          </div>                  ? 'bg-primary text-primary-foreground border-primary'        </CardContent>

        </div>

      )}                  : 'bg-card hover:bg-primary/10 border-border/50 hover:border-primary/30'      </Card>



      {/* All Clubs Comparison Table */}              }`}

      <CardWrapper

        title="Porównanie"            >      {/* Club Selection Tabs */}

        subtitle="Statystyki wszystkich klubów parlamentarnych"

      >              <div className="font-bold">{club.id}</div>      <Tabs value={selectedClubId} onValueChange={setSelectedClubId}>

        <div className="overflow-x-auto">

          <table className="w-full">              <div className="text-xs opacity-70">{club.activeMembers} posłów</div>        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">

            <thead>

              <tr className="border-b text-sm text-muted-foreground">            </button>          {clubs.slice(0, 6).map((club) => (

                <th className="text-left p-3 font-medium">Klub</th>

                <th className="text-right p-3 font-medium">Posłowie</th>          ))}            <TabsTrigger key={club.id} value={club.id} className="text-xs">

                <th className="text-right p-3 font-medium">Projekty</th>

                <th className="text-right p-3 font-medium">Wpływ</th>        </div>              {club.id}

              </tr>

            </thead>      </div>            </TabsTrigger>

            <tbody>

              {clubs.map((club) => {          ))}

                const influence = influenceScores.find(i => i.id === club.id)

                return (      {/* Selected Club Details */}        </TabsList>

                  <tr

                    key={club.id}      {selectedClub && (

                    onClick={() => setSelectedClubId(club.id)}

                    className={`border-b cursor-pointer transition-colors ${        <div className="space-y-6">        {clubs.map((club) => (

                      selectedClubId === club.id ? 'bg-primary/5' : 'hover:bg-muted/50'

                    }`}          {/* Club Header */}          <TabsContent key={club.id} value={club.id} className="space-y-4">

                  >

                    <td className="p-3">          <CardWrapper            {/* Club Details */}

                      <div className="flex items-center gap-2">

                        <Badge variant="outline">{club.id}</Badge>            title="Informacje"            <Card>

                        <span className="text-sm font-medium hidden sm:inline">

                          {club.name.replace('Klub Parlamentarny ', '')}            subtitle={selectedClub.name}              <CardHeader>

                        </span>

                      </div>          >                <CardTitle>{club.name}</CardTitle>

                    </td>

                    <td className="text-right p-3 font-semibold">{club.activeMembers}</td>            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">              </CardHeader>

                    <td className="text-right p-3">{club.bills}</td>

                    <td className="text-right p-3 text-primary font-semibold">              <div>              <CardContent className="space-y-4">

                      {influence?.influenceScore.toFixed(0) || '0'}

                    </td>                <div className="text-sm text-muted-foreground mb-1">Liczba posłów</div>                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                  </tr>

                )                <div className="text-3xl font-bold text-primary">{selectedClub.activeMembers}</div>                  <div>

              })}

            </tbody>              </div>                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

          </table>

        </div>              <div>                      <Users className="h-4 w-4" />

      </CardWrapper>

    </div>                <div className="text-sm text-muted-foreground mb-1">Projekty ustaw</div>                      <span>Członkowie</span>

  )

}                <div className="text-3xl font-bold text-primary">{selectedClub.bills}</div>                    </div>


              </div>                    <div className="text-2xl font-bold">{club.activeMembers}</div>

              <div>                  </div>

                <div className="text-sm text-muted-foreground mb-1">Wskaźnik wpływu</div>                  <div>

                <div className="text-3xl font-bold text-primary">                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  {influenceScores.find(i => i.id === selectedClub.id)?.influenceScore.toFixed(0) || '0'}                      <FileText className="h-4 w-4" />

                </div>                      <span>Projekty ustaw</span>

              </div>                    </div>

              <div>                    <div className="text-2xl font-bold">{club.bills}</div>

                <div className="text-sm text-muted-foreground mb-1">Łączne głosy</div>                  </div>

                <div className="text-3xl font-bold text-primary">                  <div>

                  {selectedClub.totalVotes.toLocaleString('pl-PL')}                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                </div>                      <Target className="h-4 w-4" />

              </div>                      <span>Tematy</span>

            </div>                    </div>

                    <div className="text-2xl font-bold">{club.topics}</div>

            {/* Contact Information */}                  </div>

            {(selectedClub.email || selectedClub.phone || selectedClub.fax) && (                  <div>

              <div className="mt-6 pt-6 border-t space-y-2">                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <div className="text-sm font-semibold text-muted-foreground mb-3">Kontakt</div>                      <TrendingUp className="h-4 w-4" />

                {selectedClub.email && (                      <span>Śr. nieobecności</span>

                  <div className="flex items-center gap-2 text-sm">                    </div>

                    <Mail className="h-4 w-4 text-primary" />                    <div className="text-2xl font-bold">{club.avgAbsences}</div>

                    <a href={`mailto:${selectedClub.email}`} className="hover:text-primary">                  </div>

                      {selectedClub.email}                </div>

                    </a>

                  </div>                {club.email && (

                )}                  <div className="pt-4 border-t">

                {selectedClub.phone && (                    <p className="text-sm text-muted-foreground">Kontakt</p>

                  <div className="flex items-center gap-2 text-sm">                    <p className="text-sm">{club.email}</p>

                    <Phone className="h-4 w-4 text-primary" />                    {club.phone && <p className="text-sm">{club.phone}</p>}

                    <span>{selectedClub.phone}</span>                  </div>

                  </div>                )}

                )}              </CardContent>

                {selectedClub.fax && (            </Card>

                  <div className="flex items-center gap-2 text-sm">

                    <Fax className="h-4 w-4 text-primary" />            {/* Demographics and Topics */}

                    <span>{selectedClub.fax}</span>            {selectedClubData && club.id === selectedClubId && (

                  </div>              <div className="grid gap-4 md:grid-cols-2">

                )}                {selectedClubData.demographics && (

              </div>                  <Card>

            )}                    <CardContent className="pt-6">

          </CardWrapper>                      <GenderDistribution demographics={selectedClubData.demographics} />

                    </CardContent>

          {/* Charts Grid */}                  </Card>

          <div className="grid gap-6 md:grid-cols-2">                )}

            {selectedDemographics && (                {selectedClubData.topics.length > 0 && (

              <CardWrapper                  <Card>

                title="Demografia"                    <CardContent className="pt-6">

                subtitle="Rozkład płci w klubie"                      <TopicDistribution topics={selectedClubData.topics} clubName={club.name} />

              >                    </CardContent>

                <GenderDistribution demographics={selectedDemographics} />                  </Card>

              </CardWrapper>                )}

            )}              </div>

            )}

            {selectedTopicsData && selectedTopicsData.topics.length > 0 && (          </TabsContent>

              <CardWrapper        ))}

                title="Priorytetowe Zagadnienia"      </Tabs>

                subtitle="Top 15 obszarów legislacyjnych"

              >      {/* Influence Score */}

                <TopicDistribution topics={selectedTopicsData.topics} clubName={selectedClub.name} />      <Card>

              </CardWrapper>        <CardHeader>

            )}          <CardTitle>Ranking Wpływu Klubów Parlamentarnych</CardTitle>

          </div>        </CardHeader>

        </div>        <CardContent>

      )}          <InfluenceScore clubs={influenceScores} />

        </CardContent>

      {/* All Clubs Comparison Table */}      </Card>

      <CardWrapper

        title="Porównanie"      {/* Clubs Table */}

        subtitle="Statystyki wszystkich klubów parlamentarnych"      <Card>

      >        <CardHeader>

        <div className="overflow-x-auto">          <CardTitle>Statystyki Wszystkich Klubów</CardTitle>

          <table className="w-full">        </CardHeader>

            <thead>        <CardContent>

              <tr className="border-b text-sm text-muted-foreground">          <div className="overflow-x-auto">

                <th className="text-left p-3 font-medium">Klub</th>            <table className="w-full text-sm">

                <th className="text-right p-3 font-medium">Posłowie</th>              <thead>

                <th className="text-right p-3 font-medium">Projekty</th>                <tr className="border-b">

                <th className="text-right p-3 font-medium">Wpływ</th>                  <th className="text-left p-2">Klub</th>

              </tr>                  <th className="text-right p-2">Członkowie</th>

            </thead>                  <th className="text-right p-2">Ustawy</th>

            <tbody>                  <th className="text-right p-2">Tematy</th>

              {clubs.map((club) => {                  <th className="text-right p-2">Śr. nieobecności</th>

                const influence = influenceScores.find(i => i.id === club.id)                </tr>

                return (              </thead>

                  <tr              <tbody>

                    key={club.id}                {clubs.map((club) => (

                    onClick={() => setSelectedClubId(club.id)}                  <tr key={club.id} className="border-b hover:bg-muted/50">

                    className={`border-b cursor-pointer transition-colors ${                    <td className="p-2 font-medium">{club.name}</td>

                      selectedClubId === club.id ? 'bg-primary/5' : 'hover:bg-muted/50'                    <td className="text-right p-2">{club.activeMembers}</td>

                    }`}                    <td className="text-right p-2">{club.bills}</td>

                  >                    <td className="text-right p-2">{club.topics}</td>

                    <td className="p-3">                    <td className="text-right p-2">{club.avgAbsences}</td>

                      <div className="flex items-center gap-2">                  </tr>

                        <Badge variant="outline">{club.id}</Badge>                ))}

                        <span className="text-sm font-medium hidden sm:inline">              </tbody>

                          {club.name.replace('Klub Parlamentarny ', '')}            </table>

                        </span>          </div>

                      </div>        </CardContent>

                    </td>      </Card>

                    <td className="text-right p-3 font-semibold">{club.activeMembers}</td>    </div>

                    <td className="text-right p-3">{club.bills}</td>  )

                    <td className="text-right p-3 text-primary font-semibold">}

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
