import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function TopicsLoading() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Hero Header Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
      </div>

      {/* Featured Topics Carousel Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-6 relative">
                <Skeleton className="h-6 w-12 absolute right-3 top-3 rounded-full" />
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      {/* Results Header Skeleton */}
      <Skeleton className="h-7 w-64" />

      {/* Topics Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center">
        <div className="flex gap-1">
          <Skeleton className="h-9 w-24" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-9 w-9" />
            ))}
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
