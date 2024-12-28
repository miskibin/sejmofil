import { CardWrapper } from "@/components/ui/card-wrapper";
import StatCard from "@/components/stat-card";
import {
  getEnvoyInfo,
  getEnvoyCommittees,
  getEnvoySpeeches,
  getEnvoyPrints,
  getEnvoySubjectPrints,
} from "@/lib/queries";
import Image from "next/image";
import { PrintList } from "@/components/print-list";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function EnvoyPage({ params }: PageProps) {
  const { id } = await params;
  const [info, committees, speechCount, prints, subjectPrints] =
    await Promise.all([
      getEnvoyInfo(id),
      getEnvoyCommittees(id),
      getEnvoySpeeches(id),
      getEnvoyPrints(id),
      getEnvoySubjectPrints(id),
    ]);

  return (
    <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-12">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl font-semibold">{`${info.firstName} ${info.lastName}`}</h1>
        <p className="text-muted-foreground">{info.club}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4">
        {/* Profile Section */}
        <div className="sm:col-span-2 lg:col-span-3">
          <CardWrapper
            title="Profil"
            subtitle="Podstawowe informacje"
            showDate={false}
          >
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={`/images/envoys/${info.id}.jpg`}
                alt={info.firstName}
                width={200}
                height={200}
                className="rounded-lg"
              />
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
          </CardWrapper>
        </div>

        {/* Stats and Activity Section */}
        <div className="sm:col-span-4 lg:col-span-9 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Liczba wypowiedzi"
              value={speechCount}
              category="Aktywność"
              sourceDescription="Liczba wypowiedzi w obecnej kadencji"
              sourceUrls={[]}
            />
            <StatCard
              title="Autorstwo druków"
              value={prints.length}
              category="Legislacja"
              sourceDescription="Liczba druków sejmowych"
              sourceUrls={[]}
            />
            <StatCard
              title="Komisje sejmowe"
              value={committees.length}
              category="Członkostwo"
              sourceDescription="Liczba komisji"
              sourceUrls={[]}
            />
          </div>

          {/* Biography if exists */}
          {info.biography && (
            <CardWrapper
              title="Biografia"
              subtitle="Informacje dodatkowe"
              showDate={false}
            >
              <p className="whitespace-pre-wrap">{info.biography}</p>
            </CardWrapper>
          )}

          {/* Committees */}
          <CardWrapper title="Komisje" subtitle="Członkostwo" showDate={false}>
            <div className="space-y-2">
              {committees.map((committee, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg flex justify-between items-center"
                >
                  <span className="font-medium">{committee.name}</span>
                  <span className="text-sm text-primary">{committee.role}</span>
                </div>
              ))}
            </div>
          </CardWrapper>

          {/* Documents Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardWrapper
              title="Druki"
              subtitle="Ostatnie autorstwo"
              showDate={false}
            >
              <PrintList prints={prints} />
            </CardWrapper>
            <CardWrapper
              title="Druki"
              subtitle="Ostatnio wspomniany"
              showDate={false}
            >
              <PrintList prints={subjectPrints} />
            </CardWrapper>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="w-full text-center">
      <span className="text-sm text-muted-foreground block">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
