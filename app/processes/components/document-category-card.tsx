import { CardWrapper } from '@/components/ui/card-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PrintShort } from '@/lib/types/print'
import {
  ClipboardList,
  FileSearch,
  FileText,
  Files,
  LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

const DOCUMENT_TYPES = {
  'Projekty ustaw': {
    matcher: (title: string) => title.toLowerCase().includes('projekt ustawy'),
    icon: FileText,
  },
  Sprawozdania: {
    matcher: (title: string) => title.toLowerCase().includes('sprawozdanie'),
    icon: ClipboardList,
  },
  Wnioski: {
    matcher: (title: string) => title.toLowerCase().includes('wniosek'),
    icon: FileSearch,
  },
  Inne: {
    matcher: () => true,
    icon: Files,
  },
} as const

interface Props {
  title: string
  subtitle: string
  icon: LucideIcon
  prints: PrintShort[]
}

export function DocumentCategoryCard({ title, subtitle, prints }: Props) {
  const categorizedPrints = prints.reduce(
    (acc, print) => {
      const category =
        Object.entries(DOCUMENT_TYPES).find(([key, { matcher }]) =>
          key === 'Inne'
            ? !Object.entries(DOCUMENT_TYPES).some(
                ([k, v]) => k !== 'Inne' && v.matcher(print.title)
              )
            : matcher(print.title)
        )?.[0] || 'Inne'

      acc[category] = [...(acc[category] || []), print]
      return acc
    },
    {} as Record<string, PrintShort[]>
  )

  const nonEmptyCategories = Object.entries(categorizedPrints).filter(
    ([, items]) => items.length > 0
  ) as [keyof typeof DOCUMENT_TYPES, PrintShort[]][]

  if (nonEmptyCategories.length === 0) return null

  return (
    <CardWrapper title={title} subtitle={subtitle} showGradient={false}>
      <Tabs defaultValue={nonEmptyCategories[0][0]}>
        <TabsList className="w-full">
          {nonEmptyCategories.map(([category]) => {
            const CategoryIcon = DOCUMENT_TYPES[category].icon
            return (
              <TabsTrigger key={category} value={category} className="flex-1">
                <CategoryIcon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{category}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
        {nonEmptyCategories.map(([category, items]) => (
          <TabsContent key={category} value={category} className="pt-4">
            <div className="space-y-3">
              {items.slice(0, 5).map((print) => (
                <Link
                  key={print.number}
                  href={`/processes/${print.processPrint[0] || print.number}`}
                  className="group flex items-start space-x-2"
                >
                  <span className="whitespace-nowrap text-xs font-medium text-primary">
                    {print.number}
                  </span>
                  <span className="line-clamp-2 flex-1 text-sm transition-colors group-hover:text-primary">
                    {print.title}
                  </span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(print.documentDate).toLocaleDateString('pl-PL')}
                  </span>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardWrapper>
  )
}
