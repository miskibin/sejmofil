// EnvoyPage.tsx
import { CardWrapper } from "@/components/ui/card-wrapper";
import StatCard from "@/components/stat-card";
import { PrintList } from "@/components/print-list";
import Image from "next/image";
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

export const dynamic = "force-dynamic";
interface InfoRowProps {
  label: string;
  value: string | number;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="w-full py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="font-medium mt-1">{value}</div>
  </div>
);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {`${info.firstName} ${info.lastName}`}
        </h1>
        <p className="text-lg text-muted-foreground">{info.club}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-4 flex flex-col gap-y-6">
          <CardWrapper
            title="Profil"
            subtitle="Podstawowe informacje"
            showSource={false}
            showDate={false}
            showGradient={false}
          >
            <div className="flex flex-col items-center space-y-6">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${info.id}/photo`}
                alt={`${info.firstName} ${info.lastName}`}
                width={60}
                height={60}
                className="rounded-lg shadow-md"
                priority
              />
              <div className="w-full space-y-4">
                <InfoRow
                  label="Okręg"
                  value={`${info.districtName} (nr ${info.districtNum})`}
                />
                <InfoRow label="Województwo" value={info.voivodeship} />
                <InfoRow label="Data urodzenia" value={info.birthDate} />
                <InfoRow label="Miejsce urodzenia" value={info.birthLocation} />
                <InfoRow label="Wykształcenie" value={info.educationLevel} />
                <InfoRow label="Zawód" value={info.profession} />
              </div>
            </div>
          </CardWrapper>
          <CardWrapper
            title="Analiza AI"
            subtitle="Ostatnie wypowiedzi"
            showDate={false}
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
        </div>

        {/* Main Content Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Biography */}
          {info.biography && (
            <div className="space-y-6">
              <CardWrapper
                title="Biografia"
                subtitle="Biografia"
                headerIcon={
                  <Link href={info.biographyUrl || "https://pl.wikipedia.org/"} target="_blank">
                    <FaWikipediaW className="h-5 w-5 text-primary" />
                  </Link>
                }
                showDate={false}
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
            title="Komisje"
            subtitle="Członkostwo"
            showDate={false}
            showGradient={false}
          >
            <div className="space-y-3">
              {committees.map((committee, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <span className="font-medium text-gray-900">
                    {committee.name}
                  </span>
                  <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {committee.role}
                  </span>
                </div>
              ))}
            </div>
          </CardWrapper>

          {/* Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardWrapper
              title="Druki"
              subtitle="Autorstwo"
              showDate={false}
              showGradient={false}
            >
              <PrintList prints={prints} />
            </CardWrapper>
            <CardWrapper
              title="Druki"
              subtitle="Wzmianki"
              showDate={false}
              showGradient={false}
            >
              <PrintList prints={subjectPrints} />
            </CardWrapper>
          </div>

          {statementsCombined.length > 0 && (
            <CardWrapper
              title="Analiza AI"
              subtitle="Ostatnie wypowiedzi"
              showDate={false}
              showGradient={false}
            >
              {/* Last 5 citations with official point */}
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Ostatnie wzmianki</h3>
                {statementsCombined
                  .slice(0, 5)
                  .map(({ official_point, statement_ai }, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-md">
                      <span className="block text-sm font-semibold">
                        {official_point}
                      </span>
                      {statement_ai.citations &&
                        statement_ai.citations[idx] && (
                          <span className="block text-sm">
                            {statement_ai.citations[idx]}
                          </span>
                        )}
                    </div>
                  ))}
              </div>

              {/* Last 5 statements with summary */}
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Skróty wypowiedzi</h3>
                {statementsCombined.slice(0, 5).map(({ statement_ai }, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded-md">
                    <p className="text-sm">{statement_ai.summary_tldr}</p>
                  </div>
                ))}
              </div>
            </CardWrapper>
          )}
        </div>
      </div>
    </>
  );
}
