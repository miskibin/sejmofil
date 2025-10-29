import { PrintShort } from '@/lib/types/print'
import Link from 'next/link'

interface PrintListProps {
  prints: PrintShort[]
}

export function PrintList({ prints }: PrintListProps) {
  if (prints.length === 0) {
    return <p className="py-4 text-center text-gray-500">Brak druków</p>
  }

  return (
    <div className="space-y-3">
      {prints.map((print) => (
        <Link
          key={print.number}
          href={`/processes/${print.number}`}
          className="block rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
        >
          <p className="line-clamp-1 font-medium">{print.title}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>Druk nr {print.number}</span>
            <span>
              {print.documentDate && !isNaN(Date.parse(print.documentDate))
                ? new Date(print.documentDate).toLocaleDateString('pl-PL')
                : 'Brak daty'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
