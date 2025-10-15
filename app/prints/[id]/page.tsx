import { CardWrapper } from '@/components/ui/card-wrapper'
import { getPrint } from '@/lib/queries/print'
import { notFound } from 'next/navigation'
import { FaRegFilePdf } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'

export default async function PrintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const print = await getPrint(id)

  if (!print) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4">
      <CardWrapper title={`Druk nr ${print.number}`}>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{print.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {print.documentDate && (
              <div>
                <span className="font-medium">Data dokumentu:</span>{' '}
                {new Date(print.documentDate).toLocaleDateString('pl-PL')}
              </div>
            )}
            {print.changeDate && (
              <div>
                <span className="font-medium">Data zmiany:</span>{' '}
                {new Date(print.changeDate).toLocaleDateString('pl-PL')}
              </div>
            )}
            {print.deliveryDate && (
              <div>
                <span className="font-medium">Data doręczenia:</span>{' '}
                {new Date(print.deliveryDate).toLocaleDateString('pl-PL')}
              </div>
            )}
            {print.documentType && (
              <div>
                <span className="font-medium">Typ:</span> {print.documentType}
              </div>
            )}
            {print.term && (
              <div>
                <span className="font-medium">Kadencja:</span> {print.term}
              </div>
            )}
          </div>

          {print.summary && (
            <div>
              <h3 className="mb-2 font-medium">Podsumowanie:</h3>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{print.summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {print.attachments && print.attachments.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Załączniki:</h3>
              <div className="space-y-2">
                {print.attachments.map((attachment) => (
                  <a
                    key={attachment}
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-white p-2 text-sm text-primary shadow-sm"
                  >
                    <FaRegFilePdf className="h-6 w-6" />
                    <span>{attachment}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {print.processPrint && print.processPrint.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Powiązane procesy:</h3>
              <div className="space-y-1">
                {print.processPrint.map((processId) => (
                  <div key={processId} className="text-sm">
                    <a
                      href={`/processes/${processId}`}
                      className="text-primary hover:underline"
                    >
                      Proces {processId}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  )
}
