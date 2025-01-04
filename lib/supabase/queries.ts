import { createClient } from "@/supabase/server";
import { StatementCombined } from "../types/statement";

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
  summary_main: string;
  summary_tldr: string;
  // statements: {
  //   id: number;
  //   speaker_name: string;
  //   text: string;
  //   statement_ai: {
  //     summary_tldr: string;
  //     citations: string[];
  //     speaker_rating: Record<string, number>;
  //   };
  // }[];
}

export async function getPointDetails(
  id: number
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
      summary_tldr
      `
      // statements:statement(
      //   id,
      //   speaker_name,
      //   text,
      //   statement_ai (
      //     summary_tldr,
      //     citations,
      //     speaker_rating
      //   )
      // )
    )
    .eq("id", id)
    .single();

  return data as unknown as PointWithStatements;
}
