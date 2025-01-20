import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProcessStage, Topic } from '@/lib/types/process'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Person } from '@/lib/types/person'
import { Comment, Print } from '@/lib/types/print'
import { ChevronDown, ChevronRight, FileText, User, Users } from 'lucide-react'
import Markdown from 'react-markdown'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
export const AuthorsSection = ({
  authorsByClub,
}: {
  authorsByClub: Record<string, Person[]>
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Autorzy</CardTitle>
        <h2 className="text-2xl font-semibold">Według klubów</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(authorsByClub).map(([club, authors]) => (
          <div key={club} className="space-y-3">
            {authors.length > 10 ? (
              <Collapsible>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {club} ({authors.length})
                  </Badge>
                  <CollapsibleTrigger className="rounded-full p-1 hover:bg-accent">
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 gap-2 pl-2 md:grid-cols-2">
                    {authors.map((author) => (
                      <div
                        key={author.firstLastName}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span>{author.firstLastName}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {club} ({authors.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 pl-2 md:grid-cols-2">
                  {authors.map((author) => (
                    <div
                      key={author.firstLastName}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <User className="h-4 w-4 text-primary" />
                      <span>{author.firstLastName}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export const TopicsSection = ({ topics }: { topics: Topic[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm text-primary">Tematy</CardTitle>
      <h2 className="text-2xl font-semibold">Zagadnienia</h2>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {topics.map((topic) => (
          <div
            key={topic.name}
            className="flex flex-col gap-2 rounded-md border-primary/10 bg-primary/5 p-3"
          >
            <span className="font-medium text-primary">{topic.name}</span>
            {topic.description.startsWith('{')
              ? JSON.parse(topic.description)[topic.name]
              : topic.description}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export const RelatedPrintsSection = ({ prints }: { prints: Print[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm text-primary">Druki</CardTitle>
      <h2 className="text-2xl font-semibold">Powiązane dokumenty</h2>
    </CardHeader>
    <CardContent className="space-y-2">
      {prints.map((print) => (
        <a
          href={`/processes/${print.number}`}
          key={print.number}
          className="block rounded-lg border p-3 transition-colors hover:bg-primary/5"
        >
          <div className="mb-1 flex items-center justify-between">
            <Badge variant="outline">Nr {print.number}</Badge>
            <span className="text-xs text-muted-foreground">
              {print.documentType}
            </span>
          </div>
          <h3 className="line-clamp-2 text-sm text-primary">{print.title}</h3>
        </a>
      ))}
    </CardContent>
  </Card>
)

export const ProcessStagesSection = ({
  stages,
}: {
  stages: ProcessStage[]
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm text-primary">Przebieg</CardTitle>
      <h2 className="text-2xl font-semibold">Etapy procesu</h2>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div
            key={`${stage.stageName}-${stage.date}`}
            className="relative flex items-start gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {index + 1}
              </div>
              {index < stages.length - 1 && (
                <div className="absolute left-4 top-8 -z-10 h-full w-0.5 bg-primary/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-lg font-medium">{stage.stageName}</div>
              <div className="mb-2 text-sm text-muted-foreground">
                {stage.date}
              </div>
              {Array.isArray(stage.childStages) &&
                stage.childStages.length > 0 && (
                  <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                    {stage.childStages.map((child) => (
                      <div
                        key={`${child.stageName}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span>{child.stageName}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Add new TopicPrintsSection component
export const TopicPrintsSection = ({ prints }: { prints: Print[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm text-primary">Dokumenty</CardTitle>
      <h2 className="text-2xl font-semibold">Lista podobnych druków</h2>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-64">
        <div className="space-y-2 pr-4">
          {prints.map((print) => (
            <a
              href={`/processes/${print.number}`}
              key={print.number}
              className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="mb-1 flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Nr {print.number}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {print.documentType}
                </span>
              </div>
              <h3 className="line-clamp-2 text-sm text-primary">
                {print.title}
              </h3>
            </a>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
)

// Add new SubjectsSection component
export const SubjectsSection = ({ subjects }: { subjects: Person[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-sm text-primary">Podmioty</CardTitle>
      <h2 className="text-2xl font-semibold">Lista podmiotów</h2>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {subjects.map((subject) => (
            <div
              key={subject.firstLastName}
              className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent/50"
            >
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">{subject.firstLastName}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Add new CommentsCarouselSection component
export const CommentsCarouselSection = ({
  comments,
}: {
  comments: Comment[]
}) => {
  if (comments.length === 0) return null
  return (
    <Card className="mt-8 w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Opinie</CardTitle>
        <h2 className="text-2xl font-semibold">
          Komentarze i opinie ({comments.length})
        </h2>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {comments.map((comment, index) => (
              <CarouselItem
                key={`${index}`}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-primary">
                      {comment.author}
                    </span>
                    <Badge
                      variant={
                        comment.sentiment === 'Pozytywny'
                          ? 'default'
                          : comment.sentiment === 'Negatywny'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {comment.sentiment}
                    </Badge>
                  </div>
                  {comment.organization && (
                    <span className="mb-2 block text-xs text-muted-foreground">
                      ({comment.organization})
                    </span>
                  )}
                  <Markdown className="prose text-sm dark:prose-invert">
                    {comment.summary}
                  </Markdown>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  )
}
