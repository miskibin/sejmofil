import { getProcessDetails } from "@/lib/queries/process";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import LegislativeTimeline from "./stepper";

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
      {/* Header section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge>{process.documentType}</Badge>
          {process.UE === "YES" && (
            <Badge variant="secondary">Projekt UE</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold">{process.title}</h1>
        <p className="text-muted-foreground">{process.description}</p>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        <LegislativeTimeline data={process} />
      </Card>

      {/* Comments section */}
      {process.comments && (
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Uwagi</h2>
          <ReactMarkdown className="prose prose-sm max-w-none">
            {process.comments}
          </ReactMarkdown>
        </Card>
      )}
    </div>
  );
}
