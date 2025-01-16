import {
  getProcessDetails,
  getActsForProcess,
  getProcessVotings,
  getSimilarPrints,
} from "@/lib/queries/process";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import LegislativeTimeline from "../components/stepper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import {  FileText, Sparkles } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import Link from "next/link";
import { getPrintComments } from "@/lib/queries/print";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { VotingList } from "@/components/voting-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Vote } from "lucide-react";

type Comment = {
  sentiment: "Neutralny" | "Pozytywny" | "Negatywny";
  summary: string;
  author: string;
  organization: string;
};

function constructActUrl(eli: string) {
  const baseUrl = `https://api.sejm.gov.pl/eli/acts`;
  return `${baseUrl}/${eli}/text.pdf`;
}

const CommentBadge = ({ sentiment }: { sentiment: Comment["sentiment"] }) => {
  const variants = {
    Neutralny: "bg-gray-100 text-gray-800",
    Pozytywny: "bg-green-100 text-green-800",
    Negatywny: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        variants[sentiment]
      )}
    >
      {sentiment}
    </span>
  );
};

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processDetails = await getProcessDetails(id);
  if (!processDetails) notFound();

  // Get the source print for this process or find a print from stages
  const sourcePrint = processDetails.prints.flat()[0];
  const stagePrint = !sourcePrint
    ? processDetails.stages
        .flatMap((stage) => [
          ...(stage.prints || []),
          ...(stage.childPrints || []),
        ])
        .find((print) => print?.number)
    : null;

  const printNumber = sourcePrint?.number || stagePrint?.number;

  const [acts, votings, similarPrints] = await Promise.all([
    getActsForProcess(id),
    getProcessVotings(id),
    printNumber ? getSimilarPrints(printNumber) : Promise.resolve([]),
  ]);

  const comments = await getPrintComments(id);

  // Flatten the nested prints array
  const allPrints = processDetails.prints.flat();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            {processDetails.documentType}
          </h1>
          <h2 className="text-lg text-muted-foreground leading-tight mb-4">
            {processDetails.title}
          </h2>
          {processDetails.UE === "YES" && (
            <Badge variant="secondary">Projekt UE</Badge>
          )}
        </div>

        <p className="text-muted-foreground">{processDetails.description}</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
        {/* Timeline - Spans full width */}
        <div className="md:col-span-2">
          <CardWrapper
            title="Przebieg procesu legislacyjnego"
          >
            <div className="max-w-4xl mx-auto">
              <LegislativeTimeline data={processDetails} />
            </div>
          </CardWrapper>
        </div>

        {/* Right side - Tabbed content */}
        <div className="md:col-span-2">
          <CardWrapper className="min-h-96 h-full">
            <Tabs defaultValue="prints" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="prints" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Druki</span>
                </TabsTrigger>
                {acts.length > 0 && (
                  <TabsTrigger value="acts" className="flex-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Dokumenty</span>
                  </TabsTrigger>
                )}
                {votings.length > 0 && (
                  <TabsTrigger value="votings" className="flex-1">
                    <Vote className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Głosowania</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="prints" className="mt-4">
                {allPrints.length > 0 ? (
                  <div className="space-y-4">
                    {allPrints.map((print) => (
                      <div
                        key={print.number}
                        className="bg-gray-50 rounded-lg p-4 space-y-4"
                      >
                        {/* Print Header */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium">{print.title}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(print.documentDate).toLocaleDateString(
                              "pl-PL"
                            )}
                          </span>
                        </div>

                        {/* Print Summary */}
                        {print.summary && (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{print.summary}</ReactMarkdown>
                          </div>
                        )}

                        {/* Print Comments */}
                        {comments.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <h5 className="text-sm font-medium text-muted-foreground">
                              Opinie ({comments.length})
                            </h5>
                            <div className="space-y-3">
                              {comments.map((comment, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-3 rounded-lg space-y-2"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-sm font-medium">
                                      {comment.organization}
                                    </span>
                                    <CommentBadge
                                      sentiment={comment.sentiment}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <ReactMarkdown>
                                      {comment.summary}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {print.attachments?.length > 0 && (
                          <div className="space-y-2">
                            {print.attachments.map((attachment) => (
                              <Link
                                key={attachment}
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-primary bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                              >
                                <FaRegFilePdf className="h-6 w-6 inline mx-2" />
                                {attachment}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Proces bez druku" image="/empty.svg" />
                )}
              </TabsContent>

              {acts.length > 0 && (
                <TabsContent value="acts" className="mt-4">
                  <div className="space-y-4">
                    {acts.map((act) => (
                      <div
                        key={act.ELI}
                        className="bg-gray-50 rounded-lg p-4 space-y-2"
                      >
                        <Badge variant="outline" className="me-2">
                          {act.ELI}
                        </Badge>
                        <Badge variant="outline" className="me-2">
                          Ogłoszono: {act.announcementDate}
                        </Badge>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium">{act.title}</h4>
                        </div>
                        <Link
                          href={constructActUrl(act.ELI)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Czytaj
                        </Link>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}

              {votings.length > 0 && (
                <TabsContent value="votings" className="mt-4">
                  <VotingList votings={votings} />
                </TabsContent>
              )}
            </Tabs>
          </CardWrapper>
        </div>
      </div>

      {/* Replace the existing Similar Prints Section with this */}
      {similarPrints.length > 0 && (
        <div className="mt-8">
          <CardWrapper
            title="Podobne"
            headerIcon={
              <Sparkles className="w-4 h-4 m-1 text-white " fill="white" />
            }
          >
            <div className="divide-y divide-gray-100">
              {similarPrints.map((print) => (
                <Link
                  key={print.number}
                  prefetch={true}
                  href={`/processes/${print.processPrint}`}
                  className="block py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-medium">
                        {print.number}
                      </span>
                      <span className="">
                        {print.title.includes("w sprawie")
                          ? "Druk dot. " +
                            print.title.split("w sprawie")[1].trim()
                          : print.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardWrapper>
        </div>
      )}
    </div>
  );
}
