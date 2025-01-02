import { CardWrapper } from "@/components/ui/card-wrapper";
import Image from "next/image";
import { MapPin, Calendar, GraduationCap, Briefcase, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Envoy } from "@/lib/types";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-2 py-1">
    <div className="text-muted-foreground w-4">{icon}</div>
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  </div>
);

export function ProfileCard(envoy: Envoy) {
  return (
    <CardWrapper
      title={envoy.club}
      subtitle={`${envoy.firstName} ${envoy.lastName}`}
      showSource={false}
      showGradient={false}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${envoy.id}/photo`}
            alt={`${envoy.firstName} ${envoy.lastName}`}
            width={80}
            height={80}
            className="rounded-lg shadow-md"
            priority
          />
          {envoy.email && (
            <a
              href={`mailto:${envoy.email}`}
              className="no-underline"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                type="button"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Kontakt</span>
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-4 gap-y-1">
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Okręg"
            value={`${envoy.districtName} (${envoy.districtNum})`}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Województwo"
            value={envoy.voivodeship}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Data ur."
            value={envoy.birthDate}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Miejsce ur."
            value={envoy.birthLocation}
          />
          <InfoRow
            icon={<GraduationCap className="h-4 w-4" />}
            label="Wykształcenie"
            value={envoy.educationLevel}
          />
          <InfoRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Zawód"
            value={envoy.profession}
          />
        </div>
      </div>
    </CardWrapper>
  );
}
