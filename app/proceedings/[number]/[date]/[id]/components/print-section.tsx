import { EmptyState } from "@/components/empty-state";
import { FaRegFilePdf } from "react-icons/fa";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type PrintWithStage = {
  number: string;
  title: string;
  processPrint: string[];
  documentDate: string;
  attachments: string[];
  stageInfo?: {
    stageName: string;
    performerName?: string;
  };
};

const PrintItem = ({ print }: { print: PrintWithStage }) => (
  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
    <div className="flex justify-between items-start gap-2 mb-2">
      <h4 className="text-sm font-medium">{print.title}</h4>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(print.documentDate).toLocaleDateString("pl-PL")}
        </span>
      </div>
    </div>

    {print.attachments.length > 0 && (
      <div className="space-y-2">
        {print.attachments.map((attachment) => (
          <a
            key={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary bg-white p-2 rounded-lg shadow-sm"
          >
            <span>
              <FaRegFilePdf className="h-6 w-6 inline mx-2" />
              {attachment}
            </span>
          </a>
        ))}
      </div>
    )}

    {print.stageInfo && (
      <Link href={`/processes/${print.processPrint[0]}`}>
        <div className="text-sm flex flex-wrap gap-2 mt-5 items-center underline">
          <span className="font-medium text-muted-foreground">
            Etap procesu legislacyjnego:
          </span>
          <span className="">
            {print.stageInfo.stageName.replace(
              "Skierowanie",
              "Skierowano do: "
            )}
          </span>
          <ExternalLink className="h-3 w-3" />
          {print.stageInfo.performerName && (
            <span className="font-medium bg-primary/20 px-2 py-1 rounded-md">
              {print.stageInfo.performerName}
            </span>
          )}
        </div>
      </Link>
    )}
  </div>
);

export const PrintSection = ({ prints }: { prints: PrintWithStage[] }) => (
  <div>
    {prints.length > 0 ? (
      <div className="space-y-3 sm:space-y-4">
        {prints.map((print) => (
          <PrintItem key={print.number} print={print} />
        ))}
      </div>
    ) : (
      <EmptyState image="/explore.svg" text="Brak druków" />
    )}
  </div>
);
