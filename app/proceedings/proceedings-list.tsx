"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, Timer, Vote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Proceeding, PointRenderProps, ProceedingPoint } from "./types";

export function ProceedingsList({
  proceedings,
}: {
  proceedings: Proceeding[];
}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  const filteredProceedings = useMemo(
    () =>
      searchTerm.length < 2
        ? proceedings
        : proceedings
            .map((proc) => ({
              ...proc,
              proceeding_day: proc.proceeding_day
                .map((day) => ({
                  ...day,
                  proceeding_point_ai: day.proceeding_point_ai.filter((point) =>
                    point.topic.toLowerCase().includes(searchTerm.toLowerCase())
                  ),
                }))
                .filter((day) => day.proceeding_point_ai.length > 0),
            }))
            .filter((proc) => proc.proceeding_day.length > 0),
    [proceedings, searchTerm]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setOpenSections(
        value.length >= 2
          ? filteredProceedings.flatMap((proc) =>
              proc.proceeding_day.map((day) => `day-${day.id}`)
            )
          : []
      );
    },
    [filteredProceedings]
  );

  const handlePointClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  const renderPoint = ({
    point,
    pointsByNumber,
    proceeding,
    day,
  }: PointRenderProps) => {
    const pointNumber = point.official_point?.split(".")[0];
    const points = pointsByNumber[pointNumber] || [];
    const lastIndex = points.length - 1;
    const currentIndex = points.findIndex((p) => p.id === point.id);
    const isInterrupted = points.length > 1 && currentIndex < lastIndex;
    const isContinuation = points.length > 1 && currentIndex === lastIndex;

    return (
      <div
        key={point.id}
        className="relative pl-2 sm:pl-6 border-l hover:border-primary"
      >
        <Link
          href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
          className={`hover:text-primary ${
            isNavigating ? "pointer-events-none opacity-50" : ""
          }`}
          onClick={(e) =>
            handlePointClick(
              e,
              `/proceedings/${proceeding.number}/${day.date}/${point.id}`
            )
          }
          prefetch={false}
        >
          <div className="text-sm break-words">
            <span className="text-muted-foreground">
              {point.official_point ? `${pointNumber}.` : <i>(Bez numeru)</i>}
            </span>{" "}
            <span>{point.topic.split(" | ")[1] || point.topic}</span>{" "}
            {isInterrupted && (
              <span className="text-destructive italic">(przerwano)</span>
            )}
            {isContinuation && (
              <span className="text-primary italic">(kontynuacja)</span>
            )}{" "}
            {(point.votingResults?.length ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1"
              >
                <Vote className="h-3 w-3" />
                {point.votingResults?.length}
              </Badge>
            )}
          </div>
        </Link>
      </div>
    );
  };

  const getPointsByNumber = (
    proceeding: Proceeding
  ): Record<string, ProceedingPoint[]> =>
    proceeding.proceeding_day.reduce((acc, day) => {
      day.proceeding_point_ai.forEach((point) => {
        if (point.official_point) {
          const number = point.official_point.split(".")[0];
          if (!acc[number]) acc[number] = [];
          acc[number].push({ ...point, date: day.date });
        }
      });
      return acc;
    }, {} as Record<string, ProceedingPoint[]>);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {searchTerm.length < 2
            ? "Wpisz minimum 2 znaki aby wyszukać"
            : !filteredProceedings.length && "Brak wyników"}
        </p>
      </div>

      {(searchTerm.length < 2 ? proceedings : filteredProceedings).map(
        (proceeding) => {
          const pointsByNumber = getPointsByNumber(proceeding);
          Object.values(pointsByNumber).forEach((points) =>
            points.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          );

          return (
            <CardWrapper
              key={proceeding.number}
              title={`${new Date(proceeding.dates[0]).toLocaleDateString(
                "pl-PL"
              )} - ${new Date(
                proceeding.dates[proceeding.dates.length - 1]
              ).toLocaleDateString("pl-PL")}`}
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
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {`${new Date(day.date).toLocaleDateString(
                            "pl-PL"
                          )} - ${new Date(
                            proceeding.dates[proceeding.dates.length - 1]
                          ).toLocaleDateString("pl-PL")}`}
                        </span>
                        {!day.proceeding_point_ai?.length && (
                          <Badge variant={"destructive"}>
                            brak danych
                          </Badge>
                        )}
                        {day.proceeding_point_ai.some(
                          (p) => p.votingResults?.length
                        ) && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Vote className=" ms-1 h-3 w-3" /> Głosowań:{" "}
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
                          (p) => p.breakVotingsCount
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
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-3 ml-2 sm:ml-6 border-l">
                        {day.proceeding_point_ai?.map((point) =>
                          renderPoint({
                            point,
                            pointsByNumber,
                            proceeding,
                            day,
                          })
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardWrapper>
          );
        }
      )}
    </div>
  );
}
