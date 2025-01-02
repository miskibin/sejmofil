import { createClient } from "@/app/supabase/server";
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
        official_point,
        statement_ai (
          summary_tldr,
          citations,
          speaker_rating
        )
      `
    )
    .eq("speaker_name", name);

  if (!data) return [];
  console.log(data);
  return data as unknown as StatementCombined[];
}
