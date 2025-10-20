import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 p-2 sm:p-4 max-w-7xl mx-auto">
      <div className="flex-1 min-w-0 space-y-12">
        {/* Navigation Skeleton */}
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        {/* Post Skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
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
          ))}
        </div>
      </div>
      
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
