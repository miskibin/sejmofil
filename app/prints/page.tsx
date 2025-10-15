import { CardWrapper } from '@/components/ui/card-wrapper'
import { getAllProcessPrints } from '@/lib/queries/print'
import Link from 'next/link'

export default async function PrintsPage() {
  const prints = await getAllProcessPrints()

  return (
    <div className="container mx-auto p-4">
      <CardWrapper title="Druki">
        <div className="space-y-3">
          {prints.map((print) => (
            <Link
              key={print.number}
              href={`/prints/${print.number}`}
              className="block rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <p className="line-clamp-1 font-medium">{print.title}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>Druk nr {print.number}</span>
                <span>
                  {print.date && !isNaN(Date.parse(print.date))
                    ? new Date(print.date).toLocaleDateString('pl-PL')
                    : 'Brak daty'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardWrapper>
    </div>
  )
}
