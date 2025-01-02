import { createClient } from "@/app/supabase/server";
import { ProceedingPointAI } from "./types/proceeding";

export async function getLatestProceedings(limit: number = 10): Promise<{
  data: ProceedingPointAI[];
  count: number;
}> {
  const supabase = await createClient();

  const [{ data, error: dataError }, { count, error: countError }] =
    await Promise.all([
      supabase
        .from("proceeding_point_ai")
        .select()
        .order("proceeding_day_id", { ascending: false })
        .limit(limit),
      supabase
        .from("proceeding_point_ai")
        .select("*", { count: "exact", head: true }),
    ]);

  if (dataError || countError) {
    throw new Error("Failed to fetch latest proceedings");
  }

  return {
    data: data as ProceedingPointAI[],
    count: count || 0,
  };
}
