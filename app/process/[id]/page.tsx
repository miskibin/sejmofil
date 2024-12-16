"use cache";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { Person } from "@/lib/types";
import Markdown from "react-markdown";
export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      (prints) => prints.filter((p) => p.processPrint?.[0] !== processNumber)
    );

    if (!print) throw new Error("Print not found");

    // Group authors by club
    const authorsByClub = authorsData.reduce((acc, author) => {
      const club = author.club || "Brak klubu";
      if (!acc[club]) acc[club] = [];
      acc[club].push(author);
      return acc;
    }, {} as Record<string, Person[]>);

    return (
      <div className="container container-fluid mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-base px-3 py-1">
            Nr {print.number}
          </Badge>
          {/* if print.processPrint[0] != processNUmber display information `ten druk należy do procesu (url to main process)  */}
          {print.processPrint[0] !== processNumber && (
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
          {/* Main column */}
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

          {/* Side column */}
          <div className="space-y-4">
            {/* Topics */}
            {topics.length > 0 && (
              <div className="border rounded-lg p-4">
                <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  Tematy
                </h2>
                <TopicsSection topics={topics} />
              </div>
            )}

            {/* Related Prints */}
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

            {/* Similar Prints */}
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

        {/* Comments Carousel */}
        {comments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              Opinie i komentarze ({comments.length})
            </h2>
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {comments.map((comment, index) => (
                  <CarouselItem
                    key={`${comment.author}-${comment.organization}-${index}`}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="border rounded-lg p-4 h-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary">
                          {comment.author}
                        </span>
                        <Badge
                          variant={
                            comment.sentiment === "Pozytywny"
                              ? "default"
                              : comment.sentiment === "Negatywny"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {comment.sentiment}
                        </Badge>
                      </div>
                      {comment.organization && (
                        <span className="text-xs text-muted-foreground block mb-2">
                          ({comment.organization})
                        </span>
                      )}
                      <Markdown className="prose dark:prose-invert text-sm">
                        {comment.summary}
                      </Markdown>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
        <TopicPrintsSection prints={topicPrints} />
        <SubjectsSection subjects={subjects} />
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return <div>Error loading process data</div>;
  }
}
