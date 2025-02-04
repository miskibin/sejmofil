// EnvoyPage.tsx
import { PrintList } from '@/components/print-list'
import StatCard from '@/components/stat-card'
import { CardWrapper } from '@/components/ui/card-wrapper'
import {
  getEnvoyCommittees,
  getEnvoyInfo,
  getEnvoySpeeches,
} from '@/lib/queries/person'
import { notFound } from 'next/navigation'
import { getEnvoyPrints, getEnvoySubjectPrints } from '@/lib/queries/print'
import { SpeakerRatingChart } from './speaker-rating-chart'
import { truncateText } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { FaWikipediaW } from 'react-icons/fa'
import Link from 'next/link'
import { ProfileCard } from './profile-card'
import { Metadata } from 'next'
import {
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from '@/components/ui/credenza'
import { getStatementCombinedDetails } from '@/lib/supabase/getStatementCombinedDetails'
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: number }>
}): Promise<Metadata> {
  const { id } = await params
  const envoy = await getEnvoyInfo(id)

  return {
    title: `${envoy.firstLastName} `,
    description: `Analiza AI, Cytaty, Biografia, działalność parlamentarna ${envoy.genitiveName} (${envoy.club})`,
  }
}

export default async function EnvoyDetail({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
  if (!id) notFound()

  const [info, committees, speechCount, prints, subjectPrints] =
    await Promise.all([
      getEnvoyInfo(id),
      getEnvoyCommittees(id),
      getEnvoySpeeches(id),
      getEnvoyPrints(id),
      getEnvoySubjectPrints(id),
    ])
  const statementsCombined = await getStatementCombinedDetails(
    info.firstLastName
  )

  const printsDetails = (
    <CredenzaContent className="max-w-[98vw] sm:max-w-2xl  p-4 rounded-lg sm:p-6">
      <CredenzaHeader className="space-y-4 text-wrap">
        <CredenzaTitle className="text-lg sm:text-xl text-start leading-tight">
          Druki autorskie
        </CredenzaTitle>
      </CredenzaHeader>
      <CredenzaBody>
        <PrintList prints={prints} />
      </CredenzaBody>
    </CredenzaContent>
  )

  const commisionsDetails = (
    <CredenzaContent className="max-w-[98vw] sm:max-w-2xl  p-4 rounded-lg sm:p-6">
      <CredenzaHeader className="space-y-4 text-wrap">
        <CredenzaTitle className="text-lg sm:text-xl text-start leading-tight">
          Komisje parlamentarne
        </CredenzaTitle>
      </CredenzaHeader>
      <CredenzaBody>
        <div className="space-y-3">
          {committees.map((committee, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center"
            >
              <span className="font-medium text-gray-900">
                {committee.name}
              </span>
              {committee.role && (
                <span className="rounded-md bg-primary/20 px-2 py-1 text-sm text-muted-foreground">
                  {committee.role}
                </span>
              )}
            </div>
          ))}
        </div>
      </CredenzaBody>
    </CredenzaContent>
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-y-6 lg:col-span-4">
          <ProfileCard {...info} />

          {/* Rest of the cards */}
          <CardWrapper
            title="Analiza AI"
            subtitle="Ostatnie wypowiedzi"
            showGradient={false}
            headerIcon={
              <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
            }
            sourceDescription="Analiza wypowiedzi z ostatnich 30 dni"
            sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
            aiPrompt="Twoj prompt"
            className="!ml-0 !pl-0"
          >
            <SpeakerRatingChart
              speakerRatings={statementsCombined.map(
                (statement) => statement.statement_ai.speaker_rating
              )}
            />
          </CardWrapper>
          <CardWrapper title="Druki" subtitle="Wzmianki" showGradient={false}>
            <PrintList prints={subjectPrints} />
          </CardWrapper>
        </div>

        {/* Main Content Section */}
        <div className="space-y-6 lg:col-span-8">
          {/* Biography */}
          {info.biography && (
            <div className="space-y-6">
              <CardWrapper
                title="O osobie"
                subtitle="Biografia"
                headerIcon={
                  <Link
                    href={info.biographyUrl || 'https://pl.wikipedia.org/'}
                    target="_blank"
                  >
                    <FaWikipediaW className="h-5 w-5 text-white" />
                  </Link>
                }
                showGradient={false}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {truncateText(info.biography, 800)}
                </p>
              </CardWrapper>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              title="Wypowiedzi"
              value={speechCount}
              category="Aktywność"
            />
            <StatCard
              title="Druki autorskie"
              value={prints.length}
              category="Legislacja"
              detailsModalContent={prints.length ? printsDetails : undefined}
            />
            <StatCard
              title="Komisje"
              value={committees.length}
              category="Członkostwo"
              detailsModalContent={
                committees.length ? commisionsDetails : undefined
              }
            />
          </div>

          {/* Documents */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
            <CardWrapper
              title="Analiza wypowiedzi"
              subtitle="Podsumowanie i cytaty"
              headerIcon={
                <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
              }
              showGradient={false}
            >
              <div className="space-y-4">
                {statementsCombined.slice(0, 5).map((statement, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    {/* Topic */}
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                      {statement.official_topic}
                    </h3>

                    {/* Summary */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        {statement.statement_ai.summary_tldr}
                      </p>
                    </div>

                    {/* Citations */}
                    {statement.statement_ai.citations?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500">
                          Cytaty:
                        </h4>
                        {statement.statement_ai.citations.map(
                          (citation, citationIdx) => (
                            <p
                              key={citationIdx}
                              className="border-l-2 border-primary/30 pl-3 text-sm italic text-gray-600"
                            >
                              {citation}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
    </>
  )
}
