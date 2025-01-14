"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ProcessDetailData } from "@/lib/queries/process";
import { PrintShort } from "@/lib/types/print";
import ReactMarkdown from "react-markdown";

const stageConfig = {
  icons: {
    czytanie: "BookOpen",
    komisj: "Users2",
    głosowanie: "Vote",
    senat: "Building2",
    prezydent: "Crown",
    zamknięcie: "CheckCircle2",
    "0": "Send",
    publikacja: "FileText",
    default: "CircleDot",
  },
  colors: {
    czytanie: "from-blue-500 to-blue-600",
    komisj: "from-emerald-500 to-emerald-600",
    głosowanie: "from-violet-500 to-violet-600",
    senat: "from-amber-500 to-amber-600",
    prezydent: "from-yellow-500 to-yellow-600",
    zamknięcie: "bg-success",
    publikacja: "from-green-500 to-green-600",
    default: "from-gray-500 to-gray-600",
  },
};

const StageIcon = ({
  stageName,
  stageNumber,
}: {
  stageName: string;
  stageNumber: string;
}) => {
  const getIconName = () => {
    const match = Object.entries(stageConfig.icons).find(
      ([key]) => key === stageNumber || stageName.toLowerCase().includes(key)
    );
    return match ? match[1] : stageConfig.icons.default;
  };

  const IconComponent = Icons[
    getIconName() as keyof typeof Icons
  ] as React.ComponentType<{ className?: string }>;
  return <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />;
};

const PrintDetails = ({ prints }: { prints: PrintShort[] }) => (
  <div className="space-y-2">
    <h4 className="font-medium flex items-center gap-2">
      <Icons.FileText className="w-4 h-4" />
      Dokumenty:
    </h4>
    {prints.map((print, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-4 text-sm space-y-1"
      >
        <div className="font-medium flex items-center gap-2">
          {print.number} - {print.title}
        </div>
        {print.documentDate && (
          <div className="text-muted-foreground">
            {format(new Date(print.documentDate), "d MMM yyyy", { locale: pl })}
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{print.summary}</ReactMarkdown>
        </div>
        {print.attachments.length > 0 && (
          <div className="space-y-1">
            {print.attachments.map((attachment) => (
              <a
                key={attachment}
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icons.Paperclip className="w-4 h-4" />
                {attachment}
              </a>
            ))}
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

const StageDetails = ({ stage }: { stage: ProcessDetailData["stages"][0] }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-4 space-y-4 text-sm"
  >
    {stage.childStages.length > 0 && (
      <div className="space-y-2">
        <h4 className="font-medium">Etapy podrzędne:</h4>
        {stage.childStages.map((childStage) => (
          <div key={childStage.number} className="ml-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/30" />
            <span>{childStage.name}</span>
            {childStage.date && (
              <span className="text-muted-foreground">
                (
                {format(new Date(childStage.date), "d MMM yyyy", {
                  locale: pl,
                })}
                )
              </span>
            )}
          </div>
        ))}
      </div>
    )}

    {stage.childCommittees.length > 0 && (
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Icons.Users2 className="w-4 h-4" />
          Komisje:
        </h4>
        {stage.childCommittees.map((committee) => (
          <div key={committee.name} className="ml-4">
            {committee.name} {committee.code && `(${committee.code})`}
          </div>
        ))}
      </div>
    )}

    {stage.votings.length > 0 && (
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Icons.Vote className="w-4 h-4" />
          Wyniki głosowania:
        </h4>
        {stage.votings.map((voting, idx) => (
          <div key={idx} className="ml-4 grid grid-cols-2 gap-2">
            <div>
              Za: <span className="text-green-600">{voting.yes}</span>
            </div>
            <div>
              Przeciw: <span className="text-red-600">{voting.no}</span>
            </div>
            <div className="col-span-2 text-muted-foreground">
              Posiedzenie {voting.sitting}, głosowanie nr {voting.votingNumber}
            </div>
          </div>
        ))}
      </div>
    )}

    {[...stage.prints, ...stage.childPrints].length > 0 && (
      <PrintDetails prints={[...stage.prints, ...stage.childPrints]} />
    )}
  </motion.div>
);

export default function LegislativeTimeline({
  data,
}: {
  data: ProcessDetailData;
}) {
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const sortedStages = [...data.stages].sort(
    (a, b) => Number(a.number) - Number(b.number)
  );

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
      {sortedStages.map((stage, index) => {
        const isExpanded = expandedStages.includes(stage.number);
        const hasDetails =
          stage.childStages.length > 0 ||
          stage.childCommittees.length > 0 ||
          stage.votings.length > 0 ||
          stage.prints.length > 0 ||
          stage.childPrints.length > 0;
        const stageColor =
          Object.entries(stageConfig.colors).find(
            ([key]) =>
              key === stage.number || stage.name.toLowerCase().includes(key)
          )?.[1] || stageConfig.colors.default;
        const firstPrint = [...stage.prints, ...stage.childPrints][0];

        return (
          <div
            key={stage.number}
            className="relative flex gap-3 sm:gap-4 pb-8 group"
          >
            {index !== sortedStages.length - 1 && (
              <div
                className={`absolute left-5 sm:left-6 top-12 w-[2px] h-[calc(100%-24px)] bg-gradient-to-b ${stageColor} opacity-20`}
              />
            )}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${stageColor} 
                         flex items-center justify-center shadow-lg shadow-primary/20 
                         group-hover:shadow-primary/30 transition-shadow`}
            >
              <StageIcon stageName={stage.name} stageNumber={stage.number} />
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div className="space-y-1">
                  <div className="font-semibold text-base  flex items-center gap-2 flex-wrap">
                    {stage.name}
                    {stage.act && (
                      <a
                        href={`https://api.sejm.gov.pl/eli/acts/${stage.act}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        (Ustawa {stage.act})
                      </a>
                    )}
                    {firstPrint && firstPrint.attachments.length > 0 && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${firstPrint.number}/${firstPrint.attachments[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        ({firstPrint.number})
                      </a>
                    )}
                    {stage.votings.length > 0 && (
                      <Icons.Vote className="w-4 h-4 text-primary" />
                    )}
                    {hasDetails && (
                      <button
                        onClick={() =>
                          setExpandedStages((prev) =>
                            prev.includes(stage.number)
                              ? prev.filter((n) => n !== stage.number)
                              : [...prev, stage.number]
                          )
                        }
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icons.ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {stage.comment && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {stage.comment}
                    </div>
                  )}
                </div>
                {stage.date && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icons.Calendar className="w-4 h-4" />
                    {format(new Date(stage.date), "d MMM yyyy", { locale: pl })}
                  </div>
                )}
              </div>

              {isExpanded && <StageDetails stage={stage} />}
            </div>
          </div>
        );
      })}
      {data.comments && <div className="mt-8 text-sm">{data.comments}</div>}
    </div>
  );
}
