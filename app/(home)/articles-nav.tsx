"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ArticlesNavProps {
  categories: string[]
}

export default function ArticlesNav({ categories }: ArticlesNavProps) {
  const navItems = [
    { label: 'Dla Ciebie', active: true },
    { label: 'Najnowsze', active: false },
    { label: 'Popularne', active: false },
    ...categories.map(category => ({
      label: category,
      active: false
    }))
  ]

  return (
    <div className="relative w-full max-w-4xl">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {navItems.map((item) => (
            <CarouselItem key={item.label} className="pl-2 md:pl-4 basis-auto">
              <button
                className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  item.active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
