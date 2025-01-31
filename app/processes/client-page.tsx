'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PrintListItem } from '@/lib/types/print'
import { getRandomPhoto } from '@/lib/utils/photos'
import ReactMarkdown from 'react-markdown'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { truncateText } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const DOCUMENT_TYPES = ['projekt ustawy', 'projekt uchwały', 'wniosek']

export default function ProcessSearchPage({
  prints = [],
}: {
  prints: PrintListItem[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('wszystkie')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const categories = useMemo(() => {
    const categoryCount = new Map<string, number>()
    prints.forEach((print) => {
      print.categories?.forEach((category) => {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
      })
    })

    const sortedCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)

    return ['wszystkie', ...sortedCategories]
  }, [prints])

  const photoUrls = useMemo(() => {
    return prints.reduce(
      (acc, print) => {
        acc[print.number] = getRandomPhoto(print.number)
        return acc
      },
      {} as Record<string, string>
    )
  }, [prints])

  const filteredPrints = prints.filter(
    (print) =>
      print.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'wszystkie' ||
        print.categories.includes(selectedCategory)) &&
      (selectedTypes.length === 0 || selectedTypes.includes(print.type))
  )

  return (
    <div className="container px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:flex-1 sm:min-w-[300px]">
          <Input
            placeholder="Szukaj projektów ustawy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-full sm:w-auto sm:min-w-[140px] justify-between"
              >
                Typ dokumentu{' '}
                {selectedTypes.length ? `(${selectedTypes.length})` : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedTypes(
                        selectedTypes.includes(type)
                          ? selectedTypes.filter((t) => t !== type)
                          : [...selectedTypes, type]
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-primary/20"
                  >
                    <div
                      className={`h-3 w-3 rounded-sm border ${
                        selectedTypes.includes(type)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}
                    />
                    {type}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="h-10 flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPrints.map((print) => (
          <Link
            key={print.number}
            href={`/processes/${print.number}`}
            className="block transition-opacity hover:opacity-90"
          >
            <Card className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <div className="flex-1 p-4 space-y-3">
                  <h2 className="font-semibold">{print.title}</h2>
                  <div className="prose-sm">
                    <ReactMarkdown>
                      {truncateText(
                        print.summary || '',
                        600
                      )}
                    </ReactMarkdown>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-2">
                      <span>{new Date(print.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{print.type}</span>
                      <span>•</span>
                      <span>{print.categories.join(', ')}</span>
                    </div>
                    {print.status && (
                      <div className="mt-1 text-primary">{print.status}</div>
                    )}
                  </div>
                </div>
                <div className="relative h-[200px] sm:h-auto sm:w-[300px]">
                  <Image
                    src={photoUrls[print.number]}
                    alt={print.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
