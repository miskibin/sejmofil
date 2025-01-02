import Image from "next/image";
import Link from "next/link";
import { Ban } from "lucide-react";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { EnvoyShort } from "@/lib/types/person";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { truncateText } from "@/lib/utils";

interface EnvoyCardProps {
  envoy: EnvoyShort;
  displayValue: string;
}

export function EnvoyCard({ envoy, displayValue }: EnvoyCardProps) {
  const fullName = `${envoy.firstName} ${envoy.lastName}`;
  const truncatedName = truncateText(fullName, 18);

  return (
    <Link href={`/envoys/${envoy.id}`}>
      <CardWrapper
        title={envoy.club || ""}
        subtitle={truncatedName}
        showSource={false}
        showGradient={false}
        headerIcon={
          <>{!envoy.active && <Ban className="text-destructive" />}</>
        }
        className="hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-20 relative flex-shrink-0">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "https://api.sejm.gov.pl/sejm/term10"
                }/MP/${envoy.id}/photo`}
                alt={fullName}
                fill
                sizes="60px"
                className="rounded-lg object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-1">
                {envoy.role &&
                  envoy.role !== "Poseł" &&
                  envoy.role != "envoy" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="inline-block truncate"
                          >
                            {truncateText(envoy.role, 28)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{envoy.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {envoy.profession || "Brak danych"}
              </p>
              <p className="text-sm text-muted-foreground">{displayValue}</p>
            </div>
          </div>
        </div>
      </CardWrapper>
    </Link>
  );
}
