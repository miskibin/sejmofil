import { Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const navItems = [
  { label: 'Dla Ciebie', active: true },
  { label: 'Najnowsze', active: false },
  { label: 'Popularne', active: false },
  { label: 'Rolnictwo', active: false },
  { label: 'Gospodarka', active: false },
  { label: 'Edukacja', active: false },
]

export default function ArticlesNav() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="shrink-0">
        <Plus className="h-4 w-4" />
      </Button>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-6 px-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      <Button variant="ghost" size="icon" className="shrink-0">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
