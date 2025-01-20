import { PrintShort } from '@/lib/types/print'
import { Clock, PiggyBank, Shield, Zap } from 'lucide-react'
import { DocumentCategoryCard } from './document-category-card'

interface DocumentCategoriesProps {
  latestPrints: PrintShort[]
  energyPrints: PrintShort[]
  immunityPrints: PrintShort[]
  taxPrints: PrintShort[]
}

export function DocumentCategories({
  latestPrints,
  energyPrints,
  immunityPrints,
  taxPrints,
}: DocumentCategoriesProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DocumentCategoryCard
        title="Najnowsze druki"
        subtitle="Ostatnio dodane dokumenty"
        icon={Clock}
        prints={latestPrints}
      />
      <DocumentCategoryCard
        title="Ceny energii"
        subtitle="Dokumenty dotyczące cen energii"
        icon={Zap}
        prints={energyPrints}
      />
      <DocumentCategoryCard
        title="Immunitet poselski"
        subtitle="Sprawy dotyczące immunitetu"
        icon={Shield}
        prints={immunityPrints}
      />
      <DocumentCategoryCard
        title="Podatki"
        subtitle="Dokumenty dotyczące podatków"
        icon={PiggyBank}
        prints={taxPrints}
      />
    </div>
  )
}
