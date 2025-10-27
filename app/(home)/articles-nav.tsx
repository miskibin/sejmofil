'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export default function ArticlesNav({
  categories,
  activeSort,
}: {
  categories: string[]
  activeSort: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navItems = [
    ['Dla Ciebie', 'foryou'],
    ['Najnowsze', 'latest'],
    ['Popularne', 'popular'],
    ...categories.map((category) => [
      category,
      `category-${encodeURIComponent(category.toLowerCase())}`,
    ]),
  ] as const

  const handleSort = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', value)
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams]
  )

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
          skipSnaps: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {navItems.map(([label, value]) => (
            <CarouselItem key={value} className="pl-2 basis-auto">
              <Button
                variant={activeSort === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort(value)}
                disabled={isPending}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  'hover:shadow-md',
                  activeSort === value && 'shadow-md',
                  isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </div>
      </Carousel>
    </div>
  )
}
