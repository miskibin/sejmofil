import { getProceedings } from "@/lib/proceedings";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

async function ProceedingsPage({}) {
  const currentPage = 1;
  const { data: proceedings, count } = await getProceedings(currentPage, 10);
  const totalPages = Math.ceil(count / 10);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Posiedzenia Sejmu</h1>

      <div className="grid gap-4">
        {proceedings.map((proceeding) => (
          <Link
            href={`/proceedings/${proceeding.proceeding_number}`}
            key={proceeding.id}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <time>
                      {format(
                        new Date(proceeding.proceeding_date),
                        "d MMMM yyyy",
                        {
                          locale: pl,
                        }
                      )}
                    </time>
                  </div>
                  <h2 className="text-lg font-medium">
                    Posiedzenie {proceeding.proceeding_number}, dzień{" "}
                    {proceeding.proceeding_day}
                  </h2>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                href={`/proceedings?page=${currentPage - 1}`}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
              <div className="px-4">
                Strona {currentPage} z {totalPages}
              </div>
              <PaginationNext
                href={`/proceedings?page=${currentPage + 1}`}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default ProceedingsPage;
