import { EmptyState } from "@/components/empty-state";
import { FaRegFilePdf } from "react-icons/fa";

type PrintWithStage = {
  number: string;
  title: string;
  documentDate: string;
  attachments: string[];
  stageInfo?: {
    stageName: string;
    performerName?: string;
  };
};

const PrintItem = ({ print }: { print: PrintWithStage }) => (
  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
    <h4 className="text-sm font-medium mb-2 flex justify-between gap-2">
      <span>{print.title}</span>
      <span className="text-xs text-muted-foreground">
        {new Date(print.documentDate).toLocaleDateString("pl-PL")}
      </span>
    </h4>

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
      <div className="text-sm flex flex-wrap gap-2 mt-5 items-center">
        <span className="font-medium text-muted-foreground">
          Etap procesu legislacyjnego:
        </span>
        <span className="">
          {print.stageInfo.stageName.replace("Skierowanie", "Skierowano do: ")}
        </span>
        {print.stageInfo.performerName && (
          <span className="font-medium bg-primary/20 px-2 py-1 rounded-md">
            {print.stageInfo.performerName}
          </span>
        )}
      </div>
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
