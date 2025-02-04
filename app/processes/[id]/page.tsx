import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VotingList } from '@/components/voting-list'
import { getPrintComments } from '@/lib/queries/print'
import {
  getActsForProcess,
  getProcessDetails,
  getProcessPrint,
  getProcessVotings,
  getSimilarPrints,
} from '@/lib/queries/process'
import { getPointsByPrintNumbers } from '@/lib/supabase/getPointsByPrintNumbers'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, Sparkles, Vote } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaRegFilePdf } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import LegislativeTimeline from '../components/stepper'
type Comment = {
  sentiment: 'Neutralny' | 'Pozytywny' | 'Negatywny'
  summary: string
  author: string
  organization: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const processId = id.includes('-') ? id : await getProcessPrint(id)
  const processDetails = await getProcessDetails(processId)
  return {
    title: processDetails?.title,
    description: processDetails?.description,
  }
}

function constructActUrl(eli: string) {
  const baseUrl = `https://api.sejm.gov.pl/eli/acts`
  return `${baseUrl}/${eli}/text.pdf`
}

const CommentBadge = ({ sentiment }: { sentiment: Comment['sentiment'] }) => {
  const variants = {
    Neutralny: 'bg-gray-100 text-gray-800',
    Pozytywny: 'bg-green-100 text-green-800',
    Negatywny: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={cn(
        'rounded-full px-2 py-1 text-xs font-medium',
        variants[sentiment]
      )}
    >
      {sentiment}
    </span>
  )
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const processId = id.includes('-') ? id : await getProcessPrint(id)
  const processDetails = await getProcessDetails(processId)
  if (!processDetails) notFound()

  // Get the source print for this process or find a print from stages
  const sourcePrint = processDetails.prints.flat()[0]
  const stagePrint = !sourcePrint
    ? processDetails.stages
        .flatMap((stage) => [
          ...(stage.prints || []),
          ...(stage.childPrints || []),
        ])
        .find((print) => print?.number)
    : null

  const printNumber = sourcePrint?.number || stagePrint?.number

  const [acts, votings, similarPrints] = await Promise.all([
    getActsForProcess(processId),
    getProcessVotings(processId),
    printNumber ? getSimilarPrints(printNumber) : Promise.resolve([]),
  ])

  const comments = await getPrintComments(processId)

  // Flatten the nested prints array
  const allPrints = processDetails.prints.flat()

  // Get print numbers from all prints
  const printNumbers = allPrints.map((print) => print.number)

  // Fetch related proceeding points
  const relatedPoints = await getPointsByPrintNumbers(printNumbers)

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h1 className="mb-2 text-2xl font-semibold">
            {processDetails.documentType}
          </h1>
          <h2 className="mb-4 text-lg leading-tight text-muted-foreground">
            {processDetails.title}
          </h2>
          {processDetails.UE === 'YES' && (
            <Badge variant="secondary">Projekt UE</Badge>
          )}
        </div>

        <p className="text-muted-foreground">{processDetails.description}</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-4">
        {/* Timeline - Spans full width */}
        <div className="md:col-span-2">
          <CardWrapper
            title="Przebieg procesu legislacyjnego"
            className="h-full"
          >
            <div className="mx-auto max-w-4xl">
              <LegislativeTimeline data={processDetails} />
            </div>
          </CardWrapper>
        </div>

        {/* Right side - Tabbed content */}
        <div className="md:col-span-2">
          <CardWrapper className="h-full min-h-96">
            <Tabs defaultValue="prints" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="prints" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Druki</span>
                </TabsTrigger>
                {acts.length > 0 && (
                  <TabsTrigger value="acts" className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Dokumenty</span>
                  </TabsTrigger>
                )}
                {votings.length > 0 && (
                  <TabsTrigger value="votings" className="flex-1">
                    <Vote className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Głosowania</span>
                  </TabsTrigger>
                )}
                {relatedPoints.length > 0 && (
                  <TabsTrigger value="points" className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Punkty obrad</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="prints" className="mt-4">
                {allPrints.length > 0 ? (
                  <div className="space-y-4">
                    {allPrints.map((print) => (
                      <div
                        key={print.number}
                        className="space-y-4 rounded-lg bg-gray-50 p-4"
                      >
                        {/* Print Header */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium">{print.title}</h4>
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(print.documentDate).toLocaleDateString(
                              'pl-PL'
                            )}
                          </span>
                        </div>

                        {/* Print Summary */}
                        {print.summary && (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{print.summary}</ReactMarkdown>
                          </div>
                        )}

                        {/* Print Comments */}
                        {comments.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h5 className="text-sm font-medium text-muted-foreground">
                              Opinie ({comments.length})
                            </h5>
                            <div className="space-y-3">
                              {comments.map((comment, idx) => (
                                <div
                                  key={idx}
                                  className="space-y-2 rounded-lg bg-white p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-medium">
                                      {comment.organization}
                                    </span>
                                    <CommentBadge
                                      sentiment={comment.sentiment}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <ReactMarkdown>
                                      {comment.summary}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {print.attachments?.length > 0 && (
                          <div className="space-y-2">
                            {print.attachments.map((attachment) => (
                              <Link
                                key={attachment}
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-white p-2 text-sm text-primary shadow-sm transition-colors hover:bg-gray-50"
                              >
                                <FaRegFilePdf className="mx-2 inline h-6 w-6" />
                                {attachment}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Proces bez druku" image="/empty.svg" />
                )}
              </TabsContent>

              {acts.length > 0 && (
                <TabsContent value="acts" className="mt-4">
                  <div className="space-y-4">
                    {acts.map((act) => (
                      <div
                        key={act.ELI}
                        className="space-y-2 rounded-lg bg-gray-50 p-4"
                      >
                        <Badge variant="outline" className="me-2">
                          {act.ELI}
                        </Badge>
                        <Badge variant="outline" className="me-2">
                          Ogłoszono: {act.announcementDate}
                        </Badge>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium">{act.title}</h4>
                        </div>
                        <Link
                          href={constructActUrl(act.ELI)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Czytaj
                        </Link>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}

              {votings.length > 0 && (
                <TabsContent value="votings" className="mt-4">
                  <VotingList votings={votings} />
                </TabsContent>
              )}

              {relatedPoints.length > 0 && (
                <TabsContent value="points" className="mt-4">
                  <div className="space-y-4">
                    {relatedPoints.map((point) => (
                      <Link
                        key={point.id}
                        href={`/proceedings/${point.proceeding_day.proceeding.number}/${point.proceeding_day.date}/${point.id}`}
                        className="block space-y-2 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium">{point.topic}</h4>
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(
                              point.proceeding_day.date
                            ).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                        {point.summary_tldr && (
                          <span className="">{point.summary_tldr}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardWrapper>
        </div>
      </div>

      {/* Replace the existing Similar Prints Section with this */}
      {similarPrints.length > 0 && (
        <div className="mt-8">
          <CardWrapper
            title="Podobne"
            headerIcon={
              <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
            }
          >
            <div className="divide-y divide-gray-100">
              {similarPrints.map((print) => (
                <Link
                  key={print.number}
                  prefetch={true}
                  href={`/processes/${print.processPrint}`}
                  className="block py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-primary">
                        {print.number}
                      </span>
                      <span className="">
                        {print.title.includes('w sprawie')
                          ? 'Druk dot. ' +
                            print.title.split('w sprawie')[1].trim()
                          : print.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardWrapper>
        </div>
      )}
    </div>
  )
}
