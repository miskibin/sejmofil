import { createClient } from "@/app/supabase/server";
import { ProceedingPoint } from "./types/proceeding";

export async function getProceedings(
  page: number = 1,
  limit: number = 10
): Promise<{
  data: ProceedingPoint[];
  count: number;
}> {
  const supabase = await createClient();
  const start = (page - 1) * limit;

  const [{ data, error: dataError }, { count, error: countError }] =
    await Promise.all([
      supabase
        .from("proceeding_points_ai")
        .select()
        .range(start, start + limit - 1)
        .order("proceeding_date", { ascending: false }),
      supabase
        .from("proceeding_points_ai")
        .select("*", { count: "exact", head: true }),
    ]);

  if (dataError || countError) {
    throw new Error("Failed to fetch proceedings");
  }

  return {
    data: data as ProceedingPoint[],
    count: count || 0,
  };
}
