"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { CalendarDays, Timer, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VotingDisplay } from "./components/voting-display";
import { Proceeding, VotingResult } from "./types";

export function ProceedingsList({
  proceedings,
}: {
  proceedings: Proceeding[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Memoize filtered proceedings
  const filteredProceedings = useMemo(() => {
    if (searchTerm.length < 2) return proceedings;
    return proceedings
      .map((proceeding) => ({
        ...proceeding,
        proceeding_day: proceeding.proceeding_day
          .map((day) => ({
            ...day,
            proceeding_point_ai: day.proceeding_point_ai.filter((point) =>
              point.topic.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter((day) => day.proceeding_point_ai.length > 0),
      }))
      .filter((proc) => proc.proceeding_day.length > 0);
  }, [proceedings, searchTerm]);

  // Handle search with transition
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      startTransition(() => {
        if (value.length >= 2) {
          // Open all sections that have matches
          setOpenSections(
            filteredProceedings
              .map((proc) => proc.proceeding_day.map((day) => `day-${day.id}`))
              .flat()
          );
        } else {
          setOpenSections([]);
        }
      });
    },
    [filteredProceedings]
  );

  return (
    <div className="space-y-4 mx-0 px-0">
      <div className="mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {searchTerm.length < 2 ? (
          <p className="text-sm text-muted-foreground mt-2">
            Wpisz minimum 2 znaki aby wyszukać
          </p>
        ) : isPending ? (
          <p className="text-sm text-muted-foreground mt-2">Wyszukiwanie...</p>
        ) : filteredProceedings.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">Brak wyników</p>
        ) : null}
      </div>

      {(searchTerm.length < 2 ? proceedings : filteredProceedings).map(
        (proceeding) => (
          <CardWrapper
            key={proceeding.number}
            title={proceeding.dates
              .map((date) => new Date(date).toLocaleDateString("pl-PL"))
              .join(", ")}
            subtitle={`Posiedzenie ${proceeding.number}`}
            showGradient={false}
          >
            <Accordion
              type="multiple"
              value={openSections}
              onValueChange={setOpenSections}
            >
              {proceeding.proceeding_day.map((day) => (
                <AccordionItem key={day.id} value={`day-${day.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(day.date).toLocaleDateString("pl-PL")} (
                          {day.proceeding_point_ai.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.proceeding_point_ai.some(
                          (p) => (p.votingResults?.length ?? 0) > 0
                        ) && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Vote className="h-3 w-3" />
                            <span>
                              {day.proceeding_point_ai.reduce(
                                (acc, p) =>
                                  acc + (p.votingResults?.length || 0),
                                0
                              )}
                            </span>
                          </Badge>
                        )}
                        {day.proceeding_point_ai.some(
                          (p) => (p.breakVotingsCount ?? 0) > 0
                        ) && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Timer className="h-3 w-3" />
                            <span>
                              Wnioski o przerwę (
                              {day.proceeding_point_ai.reduce(
                                (acc, p) => acc + (p.breakVotingsCount || 0),
                                0
                              )}
                              )
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3 ml-2 sm:ml-6 border-l">
                      {day.proceeding_point_ai?.map((point) => (
                        <div
                          key={point.id}
                          className="relative pl-2 sm:pl-6 border-l hover:border-primary"
                        >
                          <Link
                            href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
                            className="block hover:text-primary"
                          >
                            <div className="text-sm font-medium break-words">
                              {point.topic.split(" | ")[1] || point.topic}
                            </div>
                            {(point.votingResults?.length ?? 0) > 0 && (
                              <div className="flex flex-col gap-2 mt-1">
                                {point.votingResults?.map(
                                  (voting: VotingResult, idx) => (
                                    <VotingDisplay key={idx} voting={voting} />
                                  )
                                )}
                              </div>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardWrapper>
        )
      )}
    </div>
  );
}
