'use client'

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingCard() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:gap-6">
        <div className="flex-1 p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="relative h-[200px] sm:h-auto sm:w-[300px]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="container px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  )
}

export default function ProcessesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}
