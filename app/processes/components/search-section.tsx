'use client'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Input } from '@/components/ui/input'
import { PrintListItem } from '@/lib/types/print'
import debounce from 'lodash/debounce'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const searchPrints = (query: string, prints: PrintListItem[]) => {
  if (!query.trim()) return []

  const searchTerms = query.toLowerCase().split(' ')
  return prints
    .filter((print) => {
      const titleMatch = searchTerms.some((term) =>
        print.title.toLowerCase().includes(term)
      )
      const topicMatch = searchTerms.some((term) =>
        print.topicName.toLowerCase().includes(term)
      )
      return titleMatch || topicMatch
    })
    .slice(0, 4)
}

export function SearchSection({
  initialPrints,
}: {
  initialPrints: PrintListItem[]
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PrintListItem[]>([])

  const performSearch = useMemo(
    () =>
      debounce((query: string) => {
        const results = searchPrints(query, initialPrints)
        setSearchResults(results)
      }, 50),
    [initialPrints]
  )

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch])

  return (
    <CardWrapper
      title="Proces legislacyjny"
      subtitle="Wyszukaj druki sejmowe"
      showGradient={false}
    >
      <div className="space-y-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wyszukaj po tytule lub temacie..."
            className="pl-8"
          />
        </div>

        {searchQuery.trim() && searchResults.length === 0 ? (
          <div className="text-muted-foreground">Nie znaleziono wyników</div>
        ) : (
          <div className="space-y-3 border-l">
            {searchResults.map((print) => (
              <div
                key={print.number}
                className="relative border-l pl-4 transition-colors hover:border-primary"
                onClick={() =>
                  router.push(
                    `/processes/${print.processPrint[0] || print.number}`
                  )
                }
              >
                <div className="block cursor-pointer hover:text-primary">
                  <div className="text-sm font-medium">{print.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {print.topicName}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      Druk {print.number}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardWrapper>
  )
}
