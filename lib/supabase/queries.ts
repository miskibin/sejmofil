import { createClient } from "@/supabase/server";
import { StatementCombined } from "../types/statement";
import { SummaryMain } from "../types/proceeding";

export async function getEnvoyStatementDetails(name: string) {
  const supabase = createClient();

  const { data: statementData } = await (
    await supabase
  )
    .from("statement")
    .select(
      `
      id,
      speaker_name,
      speaker_function,
      number_sequence,
      official_point,
      official_topic,
      text
    `
    )
    .eq("speaker_name", name);

  return statementData || [];
}
export async function getStatementCombinedDetails(
  name: string
): Promise<StatementCombined[]> {
  const supabase = createClient();

  const { data } = await (
    await supabase
  )
    .from("statement")
    .select(
      `
        id,
        number_sequence,
        official_topic,
        statement_ai (
          summary_tldr,
          citations,
          speaker_rating
        )
      `
    )
    .eq("speaker_name", name)
    .not("number_source", "eq", 0);

  if (!data) return [];
  return data as unknown as StatementCombined[];
}

interface TopicCount {
  id: number;
  topic: string;
  count: number;
}

export async function getTopDiscussedTopics(): Promise<TopicCount[]> {
  const supabase = createClient();
  const { data } = await (await supabase)
    .rpc("get_top_discussed_topics")
    .limit(5); // Create this function in your database

  return data || [];
}

interface CitationWithPerson {
  speaker_name: string;
  citation: string;
  statement_id: number;
}

export async function getLatestCitizations(): Promise<CitationWithPerson[]> {
  const supabase = createClient();

  const { data } = await (
    await supabase
  )
    .from("statement")
    .select(
      `
      id,
      speaker_name,
      statement_ai!inner (
        citations
      )
    `
    )
    .not("statement_ai.citations", "is", null)
    .not("statement_ai.citations", "eq", "{}")
    .order("id", { ascending: false })
    .limit(4);
  if (!data) return [];

  // Process and flatten citations, keeping only unique speakers
  const uniqueSpeakers = new Set<string>();
  const citations: CitationWithPerson[] = [];

  data.forEach((item) => {
    if (uniqueSpeakers.has(item.speaker_name)) return;

    const citation = (item.statement_ai as unknown as { citations: string[] })
      .citations[0];
    if (!citation) return;

    uniqueSpeakers.add(item.speaker_name);
    citations.push({
      speaker_name: item.speaker_name,
      citation,
      statement_id: item.id,
    });
  });
  return citations.slice(0, 4); // Return only top 5 unique citations
}
interface PointWithStatements {
  id: number;
  topic: string;
  official_point: string;
  official_topic: string;
  summary_main: SummaryMain;
  summary_tldr: string;
  print_numbers: number[];
  statements: {
    id: number;
    speaker_name: string;
    text: string;
    number_source: number;
    statement_ai: {
      summary_tldr: string;
      citations: string[];
      topic_attitude: Record<string, number>;
      speaker_rating: Record<string, number>;
    };
  }[];
}
export async function getPointDetails(
  id: number,
  showAllStatements = false
): Promise<PointWithStatements> {
  const supabase = createClient();
  const { data } = await (
    await supabase
  )
    .from("proceeding_point_ai")
    .select(
      `
      id,
      topic,
      official_point,
      official_topic,
      summary_main,
      summary_tldr,
      print_numbers,
      statements:statement_to_point!proceeding_point_ai_id(
        statement:statement_id(
          id,
          speaker_name,
          text,
          number_source,
          statement_ai (
            summary_tldr,
            citations,
            topic_attitude,
            speaker_rating
          )
        )
      )
    `
    )
    .eq("id", id)
    .single();
  const transformedData = {
    ...data,
    // summary_main: JSON.parse(data?.summary_main || "{}"),
    statements:
      data?.statements
        .map((item: { statement: unknown }) => item.statement)
        .filter((statement) =>
          showAllStatements
            ? true
            : (statement as { number_source: number }).number_source !== 0
        ) || [],
  };
  console.log(transformedData);
  return transformedData as PointWithStatements;
}
