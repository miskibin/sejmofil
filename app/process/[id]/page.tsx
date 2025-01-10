import { getProcessDetails } from "@/lib/queries/process";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import LegislativeTimeline from "./stepper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import {  MessageSquare, Timer } from "lucide-react";

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const process = await getProcessDetails(id);
  if (!process) notFound();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <CardWrapper
        title={process.documentType}
        subtitle={process.title}
        headerElements={
          <div className="flex gap-2">
            {process.UE === "YES" && (
              <Badge variant="secondary">Projekt UE</Badge>
            )}
          </div>
        }
        className="bg-gradient-to-br from-background to-primary/5"
      >
        <p className="text-muted-foreground">{process.description}</p>
      </CardWrapper>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <CardWrapper
          title="Przebieg procesu legislacyjnego"
          headerIcon={<Timer className="h-5 w-5 text-primary" />}
          className="md:col-span-2"
        >
          <div className="max-w-4xl mx-auto">
            <LegislativeTimeline data={process} />
          </div>
        </CardWrapper>

        {process.comments && (
          <CardWrapper
            title="Uwagi"
            headerIcon={<MessageSquare className="h-5 w-5 text-primary" />}
            className="md:col-span-2" 
          >
            <ReactMarkdown className="prose prose-sm max-w-none">
              {process.comments}
            </ReactMarkdown>
          </CardWrapper>
        )}
      </div>
    </div>
  );
}
