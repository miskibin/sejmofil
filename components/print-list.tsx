import { PrintShort } from "@/lib/types/print";
import Link from "next/link";

interface PrintListProps {
  prints: PrintShort[];
}

export function PrintList({ prints }: PrintListProps) {
  if (prints.length === 0) {
    return <p className="text-gray-500 text-center py-4">Brak druków</p>;
  }

  return (
    <div className="space-y-3">
      {prints.map((print) => (
        <Link
          key={print.number}
          href={`/druki/${print.number}`}
          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <p className="font-medium line-clamp-1">{print.title}</p>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <span>Druk nr {print.number}</span>
            <span>
              {new Date(print.deliveryDate).toLocaleDateString("pl-PL")}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
