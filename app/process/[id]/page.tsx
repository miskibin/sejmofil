import { getProcessDetails } from "@/lib/queries/process";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import LegislativeTimeline from "./stepper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { MessageSquare, Timer, FileText } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import Link from "next/link";

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processDetails = await getProcessDetails(id);
  if (!processDetails) notFound();

  // Flatten the nested prints array
  const allPrints = processDetails.prints.flat();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <CardWrapper
        title={processDetails.documentType}
        subtitle={processDetails.title}
        headerElements={
          <div className="flex gap-2">
            {processDetails.UE === "YES" && (
              <Badge variant="secondary">Projekt UE</Badge>
            )}
          </div>
        }
        className="bg-gradient-to-br from-background to-primary/5"
      >
        <p className="text-muted-foreground">{processDetails.description}</p>
      </CardWrapper>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <CardWrapper
          title="Przebieg procesu legislacyjnego"
          headerIcon={<Timer className="h-5 w-5 text-primary" />}
          className="md:col-span-2"
        >
          <div className="max-w-4xl mx-auto">
            <LegislativeTimeline data={processDetails} />
          </div>
        </CardWrapper>

        {processDetails.comments && (
          <CardWrapper
            title="Uwagi"
            headerIcon={<MessageSquare className="h-5 w-5 text-primary" />}
            className="md:col-span-2"
          >
            <ReactMarkdown className="prose prose-sm max-w-none">
              {processDetails.comments}
            </ReactMarkdown>
          </CardWrapper>
        )}

        <CardWrapper
          title="Druki"
          headerIcon={<FileText className="h-5 w-5 text-primary" />}
          className="md:col-span-2"
        >
          <div className="space-y-3 sm:space-y-4">
            {allPrints.map((print) => (
              <div
                key={print.number}
                className="p-3 sm:p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="text-sm font-medium mb-2 flex justify-between gap-2">
                  <span>{print.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(print.documentDate).toLocaleDateString("pl-PL")}
                  </span>
                </h4>

                {print.summary && (
                  <p className="prose  max-w-none prose-sm my-2">
                    <ReactMarkdown>{print.summary}</ReactMarkdown>
                  </p>
                )}

                {print.attachments?.length > 0 && (
                  <div className="space-y-2">
                    {print.attachments.map((attachment) => (
                      <Link
                        key={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary bg-white p-2 rounded-lg shadow-sm"
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
        </CardWrapper>
      </div>
    </div>
  );
}
