"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabaseSession } from "@/lib/auth";
import PageLayout from "@/components/default-layout";
import FilterBar from "@/components/filter-bar";
import PostCard from "@/components/post-card";
import { getProceedingPoints, getTopCategories } from "@/lib/queries/home";
import { ProceedingPointWithRelations } from "@/types/custom";
import { BASE_CATEGORIES, SortCategory } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isLoading, setIsLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Reset pagination when filter changes
    setPage(1);
    setVisiblePosts([]);
    setHasMore(true);
    setIsLoading(true); // Set loading state to true when filter changes

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
        setHasMore(points.length > ITEMS_PER_PAGE);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false); // Set loading state to false when done
        }
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
        initialUserVote={post?.userVote}
        userId={user?.id}
      />
    </div>
  );

  const renderPostSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div className="flex flex-col space-y-3" key={`skeleton-${index}`}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-[100px]" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ));
  };

  return (
    <PageLayout
      filterBar={
        <div className="px-4 py-2">
          <FilterBar
            categories={categories}
            activeSort={activeSort}
            isLoading={isLoading}
          />
        </div>
      }
      sidebar={<div className="space-y-4 py-24 bg-amber-100" />}
      content={
        <div className="space-y-4">
          {isLoading ? (
            renderPostSkeleton()
          ) : visiblePosts.length > 0 ? (
            visiblePosts.map((post, index) =>
              renderPost(post, visiblePosts.length === index + 1)
            )
          ) : (
            <div className="text-center py-10">
              <p className="text-lg font-medium">Nic tu nie ma 😥</p>
              <p className="text-muted-foreground">
                Spróbuj zmienić filtry lub wróć później
              </p>
            </div>
          )}
        </div>
      }
    />
  );
}
