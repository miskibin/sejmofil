"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import {
  AuthorsSection,
  ProcessStagesSection,
  TopicsSection,
  RelatedPrintsSection,
  TopicPrintsSection,
  SubjectsSection,
  CommentsCarouselSection,
} from "@/components/sections";
import {
  getPrint,
  getPrintAuthors,
  getPrintComments,
  getRelatedPrints,
  getTopicsForPrint,
  getAllProcessStages,
  getPrintsRelatedToTopic,
  getPrintSubjects,
  getSimmilarPrints,
} from "@/lib/queries";
import { Person, Print, ProcessStage, Topic, Comment } from "@/lib/types";
import Markdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ProcessPageData {
  comments: Comment[];
  print: Print;
  stages: ProcessStage[];
  authorsByClub: Record<string, Person[]>;
  relatedPrints: Print[];
  topics: Topic[];
  subjects: Person[];
  simmilarPrints: Print[];
  topicPrints: Print[];
}

export default function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<ProcessPageData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { id: processNumber } = await params;
        const [
          print,
          stages,
          authorsData,
          comments,
          relatedPrints,
          topics,
          subjects,
          simmilarPrints,
        ] = await Promise.all([
          getPrint(processNumber),
          getAllProcessStages(processNumber),
          getPrintAuthors(processNumber),
          getPrintComments(processNumber),
          getRelatedPrints(processNumber),
          getTopicsForPrint(processNumber),
          getPrintSubjects(processNumber),
          getSimmilarPrints(processNumber),
        ]);
        // filter print, and relatedPrints from the list
        const topicPrints = await getPrintsRelatedToTopic(topics[0].name).then(
          (prints) =>
            prints.filter((p) => p.processPrint?.[0] !== processNumber)
        );

        if (!print) throw new Error("Print not found");

        // Group authors by club
        const authorsByClub = authorsData.reduce((acc, author) => {
          const club = author.club || "Brak klubu";
          if (!acc[club]) acc[club] = [];
          acc[club].push(author);
          return acc;
        }, {} as Record<string, Person[]>);

        setData({
          print,
          stages,
          authorsByClub,
          comments,
          relatedPrints,
          topics,
          subjects,
          simmilarPrints,
          topicPrints,
        } as unknown as ProcessPageData);
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      }
    }

    fetchData();
  }, [params]);

  if (error) return <div>Error loading process data: {error.message}</div>;
  if (!data) return <div>Loading process data...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="mb-4 sm:mb-8">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href={`/process/${data?.print.number}`}>
              <Badge variant="outline" className="text-base px-3 py-1 w-fit hover:bg-accent cursor-pointer transition-colors">
                Nr {data?.print.number}
              </Badge>
            </Link>
            {data?.print.processPrint[0] !== data?.print.number && (
              <a
                href={`/process/${data?.print.processPrint[0]}`}
                className="text-sm text-[#8B1538]"
              >
                Ten druk należy do procesu {data?.print.processPrint[0]}
              </a>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {data?.print &&
                new Date(data.print.documentDate).toLocaleDateString("pl-PL")}
            </div>
          </div>
          <h1 className="text-2xl font-semibold mt-4">{data?.print.title}</h1>
          <Markdown className="prose dark:prose-invert max-w-none mt-4">
            {data?.print.summary}
          </Markdown>
        </CardContent>
      </Card>

      <div className="space-y-4 sm:space-y-6">
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {Object.keys(data?.authorsByClub || {}).length > 0 && (
              <Link href="/authors" className="block hover:opacity-75 transition-opacity">
                <AuthorsSection authorsByClub={data?.authorsByClub || {}} />
              </Link>
            )}

            {data?.stages.length > 0 && (
              <ProcessStagesSection stages={data?.stages || []} />
            )}

            {data?.comments.length > 0 && (
              <CommentsCarouselSection comments={data?.comments || []} />
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {data?.topics.length > 0 && (
              <Link href="/topics" className="block hover:opacity-75 transition-opacity">
                <TopicsSection topics={data?.topics || []} />
              </Link>
            )}

            {data?.relatedPrints.length > 0 && (
              <RelatedPrintsSection prints={data?.relatedPrints || []} />
            )}

            {data?.simmilarPrints.length > 0 && (
              <RelatedPrintsSection prints={data.simmilarPrints} />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8">
            <TopicPrintsSection prints={data?.topicPrints || []} />
          </div>
          <div className="lg:col-span-4">
            <SubjectsSection subjects={data?.subjects || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
