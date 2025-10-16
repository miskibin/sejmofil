'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import ArticlesNav from './articles-nav'
import PostCard from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LatestPointsResult } from '@/lib/types/proceeding'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="w-full md:w-[200px] lg:w-[300px] aspect-video" />
    </div>
    <hr className="border-t border-gray-200" />
  </div>
)

export default function ArticlesSection({
  posts,
  sort,
  allCategories,
  isLoading,
}: {
  posts: LatestPointsResult[]
  sort: string
  allCategories: string[]
  isLoading?: boolean
}) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Reset transition state when posts change
  useEffect(() => {
    setIsTransitioning(false)
  }, [posts])

  // Filter posts client-side based on sort
  const filteredPosts = useMemo(() => {
    if (sort === 'popular') {
      return [...posts].sort((a, b) => Number(b.likes) - Number(a.likes))
    } else if (sort.startsWith('category-')) {
      const category = decodeURIComponent(sort.replace('category-', ''))
      return posts.filter(
        (post) => post.category.toLowerCase() === category.toLowerCase()
      )
    }
    // For 'latest' and 'foryou', keep original order
    return posts
  }, [posts, sort])

  const [displayedPosts, hasMore, loadMore] = useInfiniteScroll(
    filteredPosts,
    ITEMS_PER_PAGE
  )
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div className="space-y-12">
      <ArticlesNav
        categories={allCategories}
        activeSort={sort}
        onTransitionChange={setIsTransitioning}
      />
      <div
        className={cn(
          'space-y-2 md:space-y-4',
          (isLoading || isTransitioning) &&
            'opacity-60 transition-opacity duration-200'
        )}
      >
        {isLoading || isTransitioning
          ? Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} />)
          : displayedPosts.map((post) => (
              <div key={`${post.proceedingNumber}-${post.pointId}`}>
                <PostCard
                  {...post}
                  comments={parseInt(post.comments) || 0}
                  proceedingNumber={post.proceedingNumber.toString()}
                  key={post.pointId}
                />
                <hr className="border-t border-gray-200 mb-4" />
              </div>
            ))}
        {hasMore && !isLoading && (
          <div
            ref={loadingRef}
            className="h-10 flex items-center justify-center"
          >
            <Skeleton className="h-4 w-[100px]" />
          </div>
        )}
      </div>
    </div>
  )
}
