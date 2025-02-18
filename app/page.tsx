"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabaseSession } from "@/lib/auth";
import PageLayout from "@/components/default-layout";
import FilterBar from "@/components/filter-bar";
import PostCard from "@/components/post-card";
import { getProceedingPoints, getTopCategories } from "@/lib/queries";
import { ProceedingPointWithRelations } from "@/types/custom";
import { BASE_CATEGORIES, SortCategory } from "@/lib/constants";

const ITEMS_PER_PAGE = 10;

export default function HomePage() {
  const { user, error } = useSupabaseSession();
  const rawSort = useSearchParams()?.get("sort") || SortCategory.ForYou;
  const activeSort = decodeURIComponent(rawSort) as SortCategory;
  const [allPosts, setAllPosts] = useState<ProceedingPointWithRelations[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<
    ProceedingPointWithRelations[]
  >([]);
  const [categories, setCategories] = useState(BASE_CATEGORIES);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Only wait while user state is undefined
    if (user === undefined) return;

    let isMounted = true;
    (async () => {
      try {
        const [topCats, points] = await Promise.all([
          getTopCategories(),
          getProceedingPoints(activeSort, user?.id), // user?.id will be undefined if not logged in
        ]);
        if (!isMounted) return;
        setCategories([...BASE_CATEGORIES, ...topCats]);
        setAllPosts(points);
        setVisiblePosts(points.slice(0, ITEMS_PER_PAGE));
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeSort, user]);

  useEffect(() => {
    if (page > 1) {
      const newPosts = allPosts.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      );
      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }
      setVisiblePosts((prev) => [...prev, ...newPosts]);
    }
  }, [page, allPosts]);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => entries[0].isIntersecting && setPage((prev) => prev + 1)
      );
      observer.current.observe(node);
    },
    [hasMore]
  );

  const renderPost = (post: ProceedingPointWithRelations, isLast: boolean) => (
    <div ref={isLast ? lastPostElementRef : null} key={post.id}>
      <PostCard
        title={post.topic ?? ""}
        description={post.summary_tldr ?? ""}
        comments={post.voting_numbers?.length || 0}
        pointId={post.id}
        proceedingNumber={post.proceeding_day.proceeding.number}
        date={post.proceeding_day.date}
        votes={post.votes}
        initialUserVote={post.userVote}
        userId={user?.id}
      />
    </div>
  );

  return (
    <PageLayout
      filterBar={
        <div className="px-4 py-2">
          <FilterBar categories={categories} activeSort={activeSort} />
        </div>
      }
      sidebar={<div className="space-y-4 py-24 bg-amber-100" />}
      content={
        <div className="space-y-4">
          {visiblePosts.map((post, index) =>
            renderPost(post, visiblePosts.length === index + 1)
          )}
        </div>
      }
    />
  );
}
