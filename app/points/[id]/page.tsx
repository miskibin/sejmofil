import { CardWrapper } from "@/components/ui/card-wrapper";
import { getPointDetails } from "@/lib/supabase/queries";
import { Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default async function PointDetail({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  const point = await getPointDetails(id);
  console.log(id, point);
  const [category, title] = point.topic.split(" | ");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{category}</p>

      {/* Main Summary */}
      <CardWrapper
        title="Podsumowanie"
        subtitle="Analiza AI"
        headerIcon={<Sparkles className="h-5 w-5 text-primary" />}
        showGradient={false}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown className="text-lg font-medium mb-4">
            {point.summary_tldr}
          </ReactMarkdown>
          <ReactMarkdown className="text-gray-600">
            {point.summary_main}
          </ReactMarkdown>
        </div>
      </CardWrapper>

      {/* Statements */}
      {/* <CardWrapper
        title="Wypowiedzi"
        subtitle="Przebieg dyskusji"
        showGradient={false}
      >
        <div className="space-y-6">
          {point.statements.map((statement) => (
            <div
              key={statement.id}
              className="p-4 bg-gray-50 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-primary">
                  {statement.speaker_name}
                </h3>
                {statement.statement_ai?.speaker_rating && (
                  <div className="flex gap-2">
                    {Object.entries(statement.statement_ai.speaker_rating).map(
                      ([key, value]) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10"
                          title={key}
                        >
                          {key}: {Math.round(value * 100)}%
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {statement.statement_ai?.summary_tldr && (
                <p className="text-sm text-gray-600">
                  {statement.statement_ai.summary_tldr}
                </p>
              )}

              {statement.statement_ai?.citations && (
                <div className="space-y-2">
                  {statement.statement_ai.citations.map((citation, idx) => (
                    <blockquote
                      key={idx}
                      className="border-l-2 border-primary/30 pl-3 italic text-sm text-gray-600"
                    >
                      {citation}
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div> */}
      {/* </CardWrapper> */}
    </div>
  );
}
