import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <Skeleton className="h-8 w-[200px]" />
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
          ))}
      </div>
    </div>
  )
}
