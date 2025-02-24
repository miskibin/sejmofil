import { createClient } from "@/utils/supabase/server";
import { PointWithStatements } from "@/types/custom";

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
            number_sequence,
            number_source,
            statement_ai (
              summary_tldr,
              yt_sec,
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
