import { getProcessDetails } from "@/lib/queries/process";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import LegislativeTimeline from "./stepper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { MessageSquare, Timer, FileText } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import Link from "next/link";
import { getPrintComments } from "@/lib/queries/print";
import { cn } from "@/lib/utils";

type Comment = {
  sentiment: "Neutralny" | "Pozytywny" | "Negatywny";
  summary: string;
  author: string;
  organization: string;
};

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
  const comments = await getPrintComments(id);
  if (!processDetails) notFound();

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
            headerIcon={<Timer className="h-5 w-5 text-primary" />}
          >
            <div className="max-w-4xl mx-auto">
              <LegislativeTimeline data={processDetails} />
            </div>
          </CardWrapper>
        </div>

        {/* Process Comments Section - Spans 2 columns if exists */}
        <div className="md:col-span-2 gap-6 space-y-6">
          {processDetails.comments && (
            <CardWrapper
              title="Uwagi ogólne"
              headerIcon={<MessageSquare className="h-5 w-5 text-primary" />}
            >
              <ReactMarkdown className="prose prose-sm max-w-none">
                {processDetails.comments}
              </ReactMarkdown>
            </CardWrapper>
          )}
          {/* Prints Section - Spans remaining space */}
          <CardWrapper
            title="Druki i opinie"
            headerIcon={<FileText className="h-5 w-5 text-primary" />}
          >
            {allPrints.map((print) => (
              <div
                key={print.number}
                className="bg-gray-50 rounded-lg p-4 space-y-4"
              >
                {/* Print Header */}
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-medium">{print.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(print.documentDate).toLocaleDateString("pl-PL")}
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
                            <CommentBadge sentiment={comment.sentiment} />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <ReactMarkdown>{comment.summary}</ReactMarkdown>
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
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
