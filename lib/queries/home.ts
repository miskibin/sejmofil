"use server";
import { ProceedingPointWithRelations } from "@/types/custom";
import { SortCategory } from "@/lib/constants";
import supabase from "../supabaseClient";

export async function getTopCategories() {
  const { data, error } = await supabase.rpc("get_top_post_categories");

  if (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }

  return data.map((item: { category_name: any }) => item.category_name);
}

export async function getProceedingPoints(
  sortType: SortCategory = SortCategory.ForYou,
  userId?: string
) {
  // Base query building
  const baseQuery = `
    id,
    topic,
    summary_tldr,
    voting_numbers,
    proceeding_day!inner (
      date,
      proceeding!inner (
        number,
        title
      )
    )
  `;

  let query = supabase.from("proceeding_point_ai").select(baseQuery).limit(200);

  // Fetch the data based on sort type
  const { data: points, error } = await query;
  if (error) throw new Error(error.message);

  // If no points, return early
  if (!points?.length) return [];

  // Get all vote counts in one query
  const { data: voteCounts } = await supabase.rpc("get_vote_counts", {
    p_target_type: "process",
    p_target_ids: points.map((p) => p.id),
  });

  // Get user's votes if logged in
  let userVotes: Record<number, number> = {};
  if (userId) {
    const { data: userVotesData } = await supabase
      .from("user_votes")
      .select("target_id, value")
      .eq("target_type", "process")
      .eq("user_id", userId)
      .in(
        "target_id",
        points.map((p) => p.id)
      );
    console.log("🚀 ~ userVotesData:", userVotesData);

    userVotes = Object.fromEntries(
      (userVotesData || []).map((v) => [v.target_id, v.value])
    );
  }

  // Combine all data
  const enrichedPoints = points.map((point) => ({
    ...point,
    votes: {
      upvotes: voteCounts?.find((v) => v.target_id === point.id)?.upvotes || 0,
      downvotes:
        voteCounts?.find((v) => v.target_id === point.id)?.downvotes || 0,
    },
    userVote: userVotes[point.id] || null,
  }));

  // Apply sorting
  switch (sortType) {
    case SortCategory.Popular:
      return enrichedPoints.sort(
        (a, b) =>
          b.votes.upvotes -
          b.votes.downvotes -
          (a.votes.upvotes - a.votes.downvotes)
      );
    case SortCategory.Latest:
      return enrichedPoints.sort(
        (a, b) =>
          new Date(b.proceeding_day.date).getTime() -
          new Date(a.proceeding_day.date).getTime()
      );
    default:
      return enrichedPoints;
  }
}

export async function updateVote(
  targetId: number,
  value: 1 | -1 | null,
  userId: string
) {
  if (!userId) throw new Error("User must be logged in to vote");

  const client = supabase;

  if (value === null) {
    const { error } = await client
      .from("user_votes")
      .delete()
      .eq("target_type", "process")
      .eq("target_id", targetId)
      .eq("user_id", userId);

    if (error) throw error;
    return;
  }

  const { error } = await client.from("user_votes").upsert(
    {
      user_id: userId,
      target_type: "process",
      target_id: targetId,
      value,
    },
    {
      onConflict: "user_id,target_type,target_id",
    }
  );

  if (error) throw error;
}
