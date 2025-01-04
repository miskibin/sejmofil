// EnvoyPage.tsx
import { CardWrapper } from "@/components/ui/card-wrapper";
import StatCard from "@/components/stat-card";
import { PrintList } from "@/components/print-list";
import {
  getEnvoyInfo,
  getEnvoyCommittees,
  getEnvoySpeeches,
} from "@/lib/queries/person";
import { notFound } from "next/navigation";
import { getEnvoyPrints, getEnvoySubjectPrints } from "@/lib/queries/print";
import { getStatementCombinedDetails } from "@/lib/supabase/queries";
import { SpeakerRatingChart } from "./speaker-rating";
import { truncateText } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { FaWikipediaW } from "react-icons/fa";
import Link from "next/link";
import { ProfileCard } from "./profile-card";
import Image from "next/image";
import { Metadata } from "next";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  const { id } = await params;
  const envoy = await getEnvoyInfo(id);

  return {
    title: `${envoy.firstLastName} | Sejmofil`,
    description: `Profil, aktywność i analiza wypowiedzi posła ${
      envoy.firstLastName
    }. ${envoy.club ? `Klub parlamentarny: ${envoy.club}.` : ""}`,
  };
}

export default async function EnvoyDetail({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const [info, committees, speechCount, prints, subjectPrints] =
    await Promise.all([
      getEnvoyInfo(id),
      getEnvoyCommittees(id),
      getEnvoySpeeches(id),
      getEnvoyPrints(id),
      getEnvoySubjectPrints(id),
    ]);
  const statementsCombined = await getStatementCombinedDetails(
    info.firstLastName
  );
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-y-6">
          <ProfileCard {...info} />

          {/* Rest of the cards */}
          <CardWrapper
            title="Analiza AI"
            subtitle="Ostatnie wypowiedzi"
            showGradient={false}
            headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
            sourceDescription="Analiza wypowiedzi z ostatnich 30 dni"
            sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`]}
            aiPrompt="Twoj prompt"
            className="!pl-0 !ml-0"
          >
            <SpeakerRatingChart
              speakerRatings={statementsCombined.map(
                (statement) => statement.statement_ai.speaker_rating
              )}
            />
          </CardWrapper>
          <CardWrapper
            title="Współatorstwo"
            subtitle="Druki sejmowe"
            showGradient={false}
          >
            <PrintList prints={prints} />
          </CardWrapper>
          <CardWrapper title="Druki" subtitle="Wzmianki" showGradient={false}>
            <PrintList prints={subjectPrints} />
          </CardWrapper>
        </div>

        {/* Main Content Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Biography */}
          {info.biography && (
            <div className="space-y-6">
              <CardWrapper
                title="O osobie"
                subtitle="Biografia"
                headerIcon={
                  <Link
                    href={info.biographyUrl || "https://pl.wikipedia.org/"}
                    target="_blank"
                  >
                    <FaWikipediaW className="h-5 w-5 text-primary" />
                  </Link>
                }
                showGradient={false}
              >
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {truncateText(info.biography, 800)}
                </p>
              </CardWrapper>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Wypowiedzi"
              value={speechCount}
              category="Aktywność"
            />
            <StatCard
              title="Druki autorskie"
              value={prints.length}
              category="Legislacja"
            />
            <StatCard
              title="Komisje"
              value={committees.length}
              category="Członkostwo"
            />
          </div>

          {/* Committees */}
          <CardWrapper
            title="Członkostwo"
            subtitle="Komisje parlamentarne"
            showGradient={false}
          >
            {committees.length > 0 ? (
              <div className="space-y-3">
                {committees.map((committee, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <span className="font-medium text-gray-900">
                      {committee.name}
                    </span>
                    {committee.role && (
                      <span className="text-sm text-muted-foreground bg-primary/20 px-2 py-1 rounded-md">
                        {committee.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/empty.svg"
                    width={333}
                    height={333}
                    alt="No committees"
                  />
                </div>
                <p className="text-gray-500">Brak członkostwa w komisjach</p>
              </div>
            )}
          </CardWrapper>

          {/* Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <CardWrapper
              title="Analiza wypowiedzi"
              subtitle="Podsumowanie i cytaty"
              headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
              showGradient={false}
            >
              <div className="space-y-4">
                {statementsCombined.slice(0, 5).map((statement, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Topic */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
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
                              className="text-sm italic text-gray-600 border-l-2 border-primary/30 pl-3"
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
  );
}
