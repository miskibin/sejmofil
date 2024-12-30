import { createClient } from "@/app/supabase/server";
import { ProceedingPointDetails } from "@/lib/types/proceeding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { ExpandableText } from "../../expandable-text";
import { notFound } from "next/navigation";
async function getPointDetails(
  proceedingNumber: string,
  pointOrder: string
): Promise<ProceedingPointDetails> {
  const supabase = await createClient();

  // Get point data
  const { data: point, error: pointError } = await supabase
    .from("proceeding_points_ai")
    .select("*")
    .eq("proceeding_number", proceedingNumber)
    .eq("discussion_order", pointOrder)
    .single();

  if (pointError) throw new Error("Failed to fetch point");

  // Get statements for this point
  const { data: statements, error: statementsError } = await supabase
    .from("statements")
    .select("*")
    .eq("proceeding_number", proceedingNumber)
    .eq("statement_official_point", point.statement_concat_topic.split(" |")[0])
    .order("statement_order", { ascending: true });
  if (statementsError) throw new Error("Failed to fetch statements");
  // Get AI analysis for these statements
  const { data: statementsAI, error: statementsAIError } = await supabase
    .from("statements_ai")
    .select("*")
    .in(
      "statement_order",
      statements.map((s) => s.statement_order)
    )
    .in(
      "proceeding_date",
      statements.map((s) => s.proceeding_date)
    );

  if (statementsAIError) throw new Error("Failed to fetch AI statements");

  return {
    point,
    statements,
    statementsAI: statementsAI || [],
  };
}

export default async function PointPage({
  params,
}: {
  params: Promise<{ number: string; pointId: string }>;
}) {
  const { number, pointId } = await params;
  if (!number || !pointId) notFound();
  const { point, statements, statementsAI } = await getPointDetails(
    number,
    pointId
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Point Header */}
      <Card className="mb-8">
        <CardHeader>
          <Badge variant="outline" className="w-fit mb-2">
            Punkt {point.discussion_order}
          </Badge>
          <CardTitle>{point.statement_concat_topic}</CardTitle>
          <p className="text-gray-600">{point.statement_concat_description}</p>
        </CardHeader>
        {point.ai_proceeding_points_summary && (
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Podsumowanie AI</h4>
              <p>{point.ai_proceeding_points_summary}</p>
            </div>
          </CardContent>
        )}
      </Card>
      {/* Statements Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-4">Wypowiedzi</h2>
        {statements.map((statement) => {
          const aiData = statementsAI.find(
            (ai) =>
              ai.statement_order === statement.statement_order &&
              ai.proceeding_date === statement.proceeding_date
          );

          return (
            <Card key={statement.id} className="w-full">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">
                        Wypowiedź {statement.statement_order}
                      </Badge>
                      {aiData?.ai_statement_type && (
                        <Badge variant="secondary">
                          {aiData.ai_statement_type}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {statement.statement_speaker_name}
                    </CardTitle>
                    <p className="text-gray-500">
                      {statement.statement_speaker_function}
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(
                        new Date(statement.proceeding_date),
                        "d MMMM yyyy",
                        { locale: pl }
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 bg-gray-50 p-4 rounded-lg w-full md:w-auto">
                    <p className="mb-1">
                      <strong>Punkt:</strong>{" "}
                      {statement.statement_official_point}
                    </p>
                    <p>
                      <strong>Temat:</strong>{" "}
                      {statement.statement_official_topic}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <ExpandableText text={statement.statement} />
                </div>

                {aiData && (
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Analiza AI
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Podsumowanie</h4>
                        <p>{aiData.ai_statement_summary}</p>
                      </div>

                      {aiData.ai_statement_thesis_and_args &&
                        aiData.ai_statement_thesis_and_args.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">
                              Główne tezy i argumenty
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {aiData.ai_statement_thesis_and_args.map(
                                (arg, i) => (
                                  <li key={i}>{arg}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {aiData.ai_statement_interruptions &&
                        Object.keys(aiData.ai_statement_interruptions).length >
                          0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Przerywniki</h4>
                            {Object.entries(
                              aiData.ai_statement_interruptions
                            ).map(([speaker, text]) => (
                              <div
                                key={speaker}
                                className="italic mb-2 last:mb-0"
                              >
                                <span className="font-medium">{speaker}:</span>{" "}
                                {JSON.stringify(text)}
                              </div>
                            ))}
                          </div>
                        )}

                      {aiData.ai_statement_criticism &&
                        Object.keys(aiData.ai_statement_criticism).length >
                          0 && (
                          <div>
                            <h4 className="font-medium mb-2">Krytyka</h4>
                            {Object.entries(aiData.ai_statement_criticism).map(
                              ([critic, text]) => (
                                <div
                                  key={critic}
                                  className="bg-red-50 p-4 rounded-lg mb-2 last:mb-0"
                                >
                                  <span className="font-medium">{critic}:</span>{" "}
                                  {JSON.stringify(text)}
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {aiData.ai_statement_approvals &&
                        Object.keys(aiData.ai_statement_approvals).length >
                          0 && (
                          <div>
                            <h4 className="font-medium mb-2">Aprobaty</h4>
                            {Object.entries(aiData.ai_statement_approvals).map(
                              ([approver, text]) => (
                                <div
                                  key={approver}
                                  className="bg-green-50 p-4 rounded-lg mb-2 last:mb-0"
                                >
                                  <span className="font-medium">
                                    {approver}:
                                  </span>{" "}
                                  {JSON.stringify(text)}
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {aiData.ai_statement_citations &&
                        aiData.ai_statement_citations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Cytaty</h4>
                            {aiData.ai_statement_citations.map(
                              (citation, i) => (
                                <blockquote
                                  key={i}
                                  className="border-l-4 border-gray-300 pl-4 italic mb-2 last:mb-0"
                                >
                                  {citation}
                                </blockquote>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
