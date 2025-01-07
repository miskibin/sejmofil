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
  proceeding_id: number;
  date: string;
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

export async function getLatestCitizations(
  number: number
): Promise<CitationWithPerson[]> {
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
    .limit(number);
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
  voting_numbers: number[];
  print_numbers: number[];
  proceeding_day: {
    date: string;
    proceeding: {
      number: number;
    };
  };
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
      voting_numbers,
            proceeding_day (
        date,
        proceeding (
          number
        )
      ),
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
  return transformedData as unknown as PointWithStatements;
}

interface AdjacentPoint {
  id: number;
  proceeding_day: {
    date: string;
  };
}

interface AdjacentPointsResponse {
  prev: AdjacentPoint | null;
  next: AdjacentPoint | null;
}

export async function getAdjacentPoints(
  pointId: number,
  proceedingId: number
): Promise<AdjacentPointsResponse> {
  const supabase = createClient();

  const { data: currentPoint } = await (await supabase)
    .from("proceeding_point_ai")
    .select("id, proceeding_day!inner(proceeding_id, date)")
    .eq("id", pointId)
    .single();

  if (!currentPoint) return { prev: null, next: null };

  const { data: prevPoint } = await (await supabase)
    .from("proceeding_point_ai")
    .select("id, proceeding_day!inner(date)")
    .eq("proceeding_day.proceeding_id", proceedingId)
    .lt("id", pointId)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const { data: nextPoint } = await (await supabase)
    .from("proceeding_point_ai")
    .select("id, proceeding_day!inner(date)")
    .eq("proceeding_day.proceeding_id", proceedingId)
    .gt("id", pointId)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return {
    prev: prevPoint
      ? { id: prevPoint.id, proceeding_day: prevPoint.proceeding_day[0] }
      : null,
    next: nextPoint
      ? { id: nextPoint.id, proceeding_day: nextPoint.proceeding_day[0] }
      : null,
  };
}

export async function getRelatedPoint(
  pointId: number,
  officialPoint: string,
  proceedingId: number
) {
  const supabase = createClient();
  const { data } = await (
    await supabase
  )
    .from("proceeding_point_ai")
    .select(
      `
      id,
      official_point,
      proceeding_day!inner (
        proceeding_id,
        date
      )
    `
    )
    .eq("official_point", officialPoint)
    .eq("proceeding_day.proceeding_id", proceedingId)
    .neq("id", pointId)
    .order("proceeding_day(date)", { ascending: true })
    .limit(1)
    .single();
  return data;
}

interface ProceedingWithDays {
  id: number;
  number: number;
  title: string;
  dates: string[];
  proceeding_day: Array<{
    id: number;
    date: string;
    proceeding_point_ai: Array<{
      voting_numbers: number[];
      id: number;
      topic: string;
      summary_tldr: string;
    }>;
  }>;
}

export async function getProceedings(): Promise<ProceedingWithDays[]> {
  const supabase = createClient();
  const { data } = await (
    await supabase
  )
    .from("proceeding")
    .select(
      `
      id,
      number,
      title,
      dates,
      proceeding_day!inner (
        id,
        date,
        proceeding_point_ai (
          id,
          topic,
          official_point,
          summary_tldr,
          voting_numbers
        )
      )
    `
    )
    .order("number", { ascending: false });

  return data || [];
}

interface ProceedingWithDetails {
  id: number;
  number: number;
  title: string;
  dates: string[];
  proceeding_day: Array<{
    id: number;
    date: string;
    proceeding_point_ai: Array<{
      id: number;
      topic: string;
      summary_tldr: string;
      statements: Array<{
        id: number;
        speaker_name: string;
        statement_ai?: {
          speaker_rating?: Record<string, number>;
        };
      }>;
    }>;
  }>;
}

export async function getProceedingDetails(
  number: number
): Promise<ProceedingWithDetails> {
  const supabase = createClient();
  const { data } = await (
    await supabase
  )
    .from("proceeding")
    .select(
      `
      id,
      number,
      title,
      dates,
      proceeding_day!inner (
        id,
        date,
        proceeding_point_ai (
          id,
          topic,
          summary_tldr,
          statements:statement_to_point!proceeding_point_ai_id (
            statement:statement_id (
              id,
              speaker_name,
              statement_ai (
                speaker_rating
              )
            )
          )
        )
      )
    `
    )
    .eq("number", number)
    .single();

  return data as unknown as ProceedingWithDetails;
}

interface ProceedingDayDetails {
  id: number;
  date: string;
  proceeding: {
    id: number;
    number: number;
    title: string;
  };
  proceeding_point_ai: Array<{
    id: number;
    topic: string;
    summary_tldr: string;
    voting_numbers: number[];
    print_numbers: number[];
    statements: Array<{
      statement: {
        id: number;
        speaker_name: string;
        statement_ai?: {
          speaker_rating?: Record<string, number>;
          citations?: string[];
          summary_tldr?: string;
        };
      };
    }>;
  }>;
}

export async function getProceedingDayDetails(
  number: number,
  date: string
): Promise<ProceedingDayDetails> {
  const supabase = createClient();
  const { data } = await (
    await supabase
  )
    .from("proceeding_day")
    .select(
      `
      id,
      date,
      proceeding (
        id,
        number,
        title
      ),
      proceeding_point_ai (
        id,
        topic,
        summary_tldr,
        voting_numbers,
        print_numbers,
        statements:statement_to_point (
          statement:statement_id (
            id,
            speaker_name,
            statement_ai (
              speaker_rating,
              citations,
              summary_tldr
            )
          )
        )
      )
    `
    )
    .eq("proceeding.number", number)
    .eq("date", date)
    .single();

  return data as unknown as ProceedingDayDetails;
}
