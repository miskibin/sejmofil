"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  GitBranch,
  FileText,
  ChevronRight,
} from "lucide-react";
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

  const {
    print,
    stages,
    authorsByClub,
    comments,
    relatedPrints,
    topics,
    subjects,
    simmilarPrints,
    topicPrints,
  } = data;

  return (
    <div className="container container-fluid mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-base px-3 py-1">
          Nr {print.number}
        </Badge>
        {print.processPrint[0] !== print.number && (
          <a
            href={`/process/${print.processPrint[0]}`}
            className="text-base underline text-blue-600"
          >
            Ten druk należy do procesu {print.processPrint[0]}
          </a>
        )}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {new Date(print.documentDate).toLocaleDateString("pl-PL")}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-primary">{print.title}</h1>
      <Markdown className="prose dark:prose-invert max-w-none">
        {print.summary}
      </Markdown>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          {Object.keys(authorsByClub).length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4">
                <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  Autorzy
                </h2>
                <AuthorsSection authorsByClub={authorsByClub} />
              </div>
            </div>
          )}

          {stages.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4">
                <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Przebieg procesu
                </h2>
                <ProcessStagesSection stages={stages} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {topics.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                <FileText className="h-4 w-4 text-primary" />
                Tematy
              </h2>
              <TopicsSection topics={topics} />
            </div>
          )}

          {relatedPrints.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                <ChevronRight className="h-4 w-4 text-primary" />
                Powiązane druki ({relatedPrints.length})
              </h2>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <RelatedPrintsSection prints={relatedPrints} />
              </div>
            </div>
          )}

          {simmilarPrints.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                <ChevronRight className="h-4 w-4 text-primary" />
                Podobne druki ({simmilarPrints.length})
              </h2>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <RelatedPrintsSection prints={simmilarPrints} />
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentsCarouselSection comments={comments} />
      <TopicPrintsSection prints={topicPrints} />
      <SubjectsSection subjects={subjects} />
    </div>
  );
}
