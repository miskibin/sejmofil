// EnvoyPage.tsx
import { CardWrapper } from "@/components/ui/card-wrapper";
import StatCard from "@/components/stat-card";
import { PrintList } from "@/components/print-list";
import Image from "next/image";
import {
  getEnvoyInfo,
  getEnvoyCommittees,
  getEnvoySpeeches,
  getEnvoyPrints,
  getEnvoySubjectPrints,
} from "@/lib/queries";
import { notFound } from "next/navigation";



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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {`${info.firstName} ${info.lastName}`}
          </h1>
          <p className="text-lg text-muted-foreground">{info.club}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-4">
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
                  width={240}
                  height={240}
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
                  <InfoRow
                    label="Miejsce urodzenia"
                    value={info.birthLocation}
                  />
                  <InfoRow label="Wykształcenie" value={info.educationLevel} />
                  <InfoRow label="Zawód" value={info.profession} />
                </div>
              </div>
            </CardWrapper>
          </div>

          {/* Main Content Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Wypowiedzi"
                value={speechCount}
                category="Aktywność"
                sourceDescription="Liczba wypowiedzi w obecnej kadencji"
                sourceUrls={[]}
              />
              <StatCard
                title="Druki autorskie"
                value={prints.length}
                category="Legislacja"
                sourceDescription="Liczba druków sejmowych"
                sourceUrls={[]}
              />
              <StatCard
                title="Komisje"
                value={committees.length}
                category="Członkostwo"
                sourceDescription="Liczba komisji sejmowych"
                sourceUrls={[]}
              />
            </div>

            {/* Biography */}
            {info.biography && (
              <div className="space-y-6">
                <CardWrapper
                  title="Biografia"
                  subtitle="Informacje dodatkowe"
                  showDate={false}
                  showGradient={false}
                >
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {info.biography}
                  </p>
                </CardWrapper>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
