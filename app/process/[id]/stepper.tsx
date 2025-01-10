"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  Vote,
  Users2,
  ChevronDown,
  ChevronUp,
  Info,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ProcessDetailData } from "@/lib/queries/process";
import { PrintShort } from "@/lib/types/print";

interface TimelineProps {
  data: ProcessDetailData;
}

export default function LegislativeTimeline({ data }: TimelineProps) {
  const [expandedStages, setExpandedStages] = useState<string[]>([]);

  const toggleStage = (stageNumber: string) => {
    setExpandedStages((prev) =>
      prev.includes(stageNumber)
        ? prev.filter((n) => n !== stageNumber)
        : [...prev, stageNumber]
    );
  };

  const sortedStages = [...data.stages].sort((a, b) => {
    return Number(a.number) - Number(b.number);
  });

  const renderPrints = (prints: PrintShort[]) => (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Dokumenty:
      </h4>
      {prints.map((print, idx) => (
        <div key={idx} className="ml-4 text-sm space-y-1">
          <div className="font-medium">{print.title}</div>
          {print.documentDate && (
            <div className="text-muted-foreground">
              {format(new Date(print.documentDate), "d MMM yyyy", {
                locale: pl,
              })}
            </div>
          )}
          <div className="text-sm">{print.summary}</div>
          {print.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-primary">
              <Paperclip className="w-4 h-4" />
              {print.attachments.join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
        <p className="text-lg text-muted-foreground mb-2">
          {data.documentType}
        </p>
        <p className="text-muted-foreground">{data.description}</p>
      </div>

      {data.comments && (
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Komentarze
          </h2>
          <p>{data.comments}</p>
        </div>
      )}

      <div className="relative">
        {sortedStages.map((stage, index) => {
          const isExpanded = expandedStages.includes(stage.number);
          const hasDetails =
            stage.childStages.length > 0 ||
            stage.childCommittees.length > 0 ||
            stage.votings.length > 0 ||
            stage.childPrints.length > 0 ||
            stage.prints.length > 0;

          return (
            <div key={stage.number} className="relative flex gap-4 pb-12 group">
              {index !== sortedStages.length - 1 && (
                <div className="absolute left-6 top-12 w-[2px] h-[calc(100%-24px)] bg-gradient-to-b from-primary to-primary bg-[length:2px_8px] bg-repeat-y opacity-20" />
              )}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow"
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      {stage.name}
                      {hasDetails && (
                        <button
                          onClick={() => toggleStage(stage.number)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Etap {stage.number}
                    </div>
                  </div>
                  {stage.date && (
                    <div className="text-right flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(stage.date), "d MMM yyyy", {
                        locale: pl,
                      })}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4"
                  >
                    {stage.childStages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Etapy podrzędne:</h4>
                        {stage.childStages.map((childStage) => (
                          <div
                            key={childStage.number}
                            className="ml-4 text-sm flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary/30" />
                            <span>{childStage.name}</span>
                            {childStage.date && (
                              <span className="text-muted-foreground">
                                (
                                {format(
                                  new Date(childStage.date),
                                  "d MMM yyyy",
                                  { locale: pl }
                                )}
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
                          <Users2 className="w-4 h-4" />
                          Komisje:
                        </h4>
                        {stage.childCommittees.map((committee) => (
                          <div key={committee.name} className="ml-4 text-sm">
                            {committee.name}{" "}
                            {committee.code && `(${committee.code})`}
                          </div>
                        ))}
                      </div>
                    )}

                    {stage.votings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Vote className="w-4 h-4" />
                          Wyniki głosowania:
                        </h4>
                        {stage.votings.map((voting, idx) => (
                          <div
                            key={idx}
                            className="ml-4 text-sm grid grid-cols-2 gap-2"
                          >
                            <div>
                              Za:{" "}
                              <span className="text-green-600">
                                {voting.yes}
                              </span>
                            </div>
                            <div>
                              Przeciw:{" "}
                              <span className="text-red-600">{voting.no}</span>
                            </div>
                            <div className="col-span-2 text-muted-foreground">
                              Posiedzenie {voting.sitting}, głosowanie nr{" "}
                              {voting.votingNumber}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {stage.prints.length > 0 && renderPrints(stage.prints)}
                    {stage.childPrints.length > 0 &&
                      renderPrints(stage.childPrints)}
                  </motion.div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
