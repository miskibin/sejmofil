'use client'

import { useEffect, useRef } from 'react'
import ArticlesNav from './articles-nav'
import PostCard from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LatestPointsResult } from '@/lib/types/proceeding'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'

const ITEMS_PER_PAGE = 10

export default function ArticlesSection({
  posts,
  sort,
  allCategories,
  maxProceedingNumber,
}: {
  posts: LatestPointsResult[]
  sort: string
  allCategories: string[]
  maxProceedingNumber: number
}) {
  const [displayedPosts, hasMore, loadMore] = useInfiniteScroll(
    posts,
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
    <div className="space-y-6">
      <ArticlesNav categories={allCategories} activeSort={sort} />
      <div className="space-y-4 md:space-y-6">
        {displayedPosts.map((post) => (
          <PostCard
            key={`${post.proceedingNumber}-${post.pointId}`}
            {...post}
            comments={parseInt(post.comments) || 0}
            proceedingNumber={post.proceedingNumber.toString()}
            officialPoint={post.officialPoint}
            maxProceedingNumber={maxProceedingNumber}
            statementsCount={post.statementsCount}
          />
        ))}
        {hasMore && (
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
