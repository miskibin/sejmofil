"use server";
import { ProceedingPointWithRelations, VoteType } from "@/types/custom";
import { SortCategory } from "@/lib/constants";
import supabase from "../supabaseClient";
import { Json } from "@/types/supabase"; // Add this import for Json type

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
): Promise<ProceedingPointWithRelations[]> {
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

  let query = supabase.from("proceeding_point_ai").select(baseQuery);

  // Check if the sortType is one of our standard sort categories or a category filter
  const isStandardSort = Object.values(SortCategory).includes(sortType);

  // If it's not a standard sort category, treat it as a category filter
  if (!isStandardSort) {
    // Filter by the category that matches the sortType
    query = query.ilike("topic", `%${sortType}%`);
  }

  // Apply the limit after any filters
  query = query.limit(200);

  // Fetch the data based on sort type
  const { data: points, error } = await query;
  if (error) throw new Error(error.message);

  // If no points, return early
  if (!points?.length) return [];

  // Get all vote counts in one query
  const { data: voteCounts } = (await supabase.rpc("get_vote_counts", {
    p_target_type: "process",
    p_target_ids: points.map((p) => p.id),
  })) as { data: { target_id: number; upvotes: number; downvotes: number }[] };

  // Get user's votes if logged in
  let userVotes: Record<number, number> = {};
  if (userId) {
    const { data: userVotesData } = (await supabase
      .from("user_votes")
      .select("target_id, value")
      .eq("target_type", "process")
      .eq("user_id", userId)
      .in(
        "target_id",
        points.map((p) => p.id)
      )) as { data: { target_id: number; value: number }[] };

    userVotes = Object.fromEntries(
      (userVotesData || []).map((v: { target_id: number; value: number }) => [
        v.target_id,
        v.value,
      ])
    );
  }

  // Combine all data
  const enrichedPoints: ProceedingPointWithRelations[] = points.map(
    (point) => ({
      ...point,
      votes: {
        upvotes:
          voteCounts?.find((v) => v.target_id === point.id)?.upvotes || 0,
        downvotes:
          voteCounts?.find((v) => v.target_id === point.id)?.downvotes || 0,
      },
      userVote: userVotes[point.id] || null,
    })
  ) as unknown as ProceedingPointWithRelations[];

  // Apply sorting only for standard sort types
  if (isStandardSort) {
    switch (sortType) {
      case SortCategory.ForYou:
        // Custom sorting for "For You" category
        return sortForYou(enrichedPoints);

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

  // For category filters, return as is (already filtered by the query)
  return enrichedPoints;
}

// Simplified helper function to sort for the "For You" category
function sortForYou(
  points: ProceedingPointWithRelations[]
): ProceedingPointWithRelations[] {
  // Define categories to push to the bottom
  const lowPriorityCategories = [
    "sprawy organizacyjne",
    "pytania w sprawach",
    "informacja",
  ];

  return points.sort((a, b) => {
    // First, sort by week (most recent first)
    const dateA = new Date(a.proceeding_day.date);
    const dateB = new Date(b.proceeding_day.date);

    // Get year and week for comparison
    const yearA = dateA.getFullYear();
    const yearB = dateB.getFullYear();

    // Compare by year first
    if (yearA !== yearB) return yearB - yearA;

    // If same year, compare by week
    const weekA = Math.floor(
      (dateA.getTime() - new Date(yearA, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    const weekB = Math.floor(
      (dateB.getTime() - new Date(yearB, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    if (weekA !== weekB) return weekB - weekA;

    // If same week, check category priority
    const topicA = a.topic?.toLowerCase() || "";
    const topicB = b.topic?.toLowerCase() || "";

    const aIsLowPriority = lowPriorityCategories.some((cat) =>
      topicA.includes(cat)
    );
    const bIsLowPriority = lowPriorityCategories.some((cat) =>
      topicB.includes(cat)
    );

    if (aIsLowPriority && !bIsLowPriority) return 1;
    if (!aIsLowPriority && bIsLowPriority) return -1;

    // If category priority is equal, sort by total votes
    const aTotalVotes = a.votes.upvotes + a.votes.downvotes;
    const bTotalVotes = b.votes.upvotes + b.votes.downvotes;
    return bTotalVotes - aTotalVotes;
  });
}

export async function updateVote(
  targetId: number,
  value: VoteType,
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
      value: value as number,
    },
    {
      onConflict: "user_id,target_type,target_id",
    }
  );

  if (error) throw error;
}
