"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function ArticlesNav({ 
  categories, 
  activeSort,
  onTransitionChange
}: { 
  categories: string[]
  activeSort: string
  onTransitionChange?: (isTransitioning: boolean) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navItems = [
    ['Dla Ciebie', 'foryou'],
    ['Najnowsze', 'latest'],
    ['Popularne', 'popular'],
    ...categories.map(category => [
      category,
      `category-${encodeURIComponent(category.toLowerCase())}`
    ])
  ] as const

  const handleSort = useCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', value)
      router.push(`?${params.toString()}`, { scroll: false })
    })
    onTransitionChange?.(true)
  }, [router, searchParams, onTransitionChange])

  return (
    <div className="relative w-full max-w-full md:max-w-4xl">
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
          {navItems.map(([label, value]) => (
            <CarouselItem key={value} className="pl-1 sm:pl-2 md:pl-4 basis-auto">
              <button
                onClick={() => handleSort(value)}
                disabled={isPending}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  activeSort === value ? 'text-primary' : 'text-muted-foreground'
                } ${isPending ? 'opacity-50 ' : ''}`}
              >
                {label}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  )
}
