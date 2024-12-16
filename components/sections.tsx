import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Print, Person, Topic, ProcessStage, Comment } from "@/lib/types";
import { ChevronRight, User, ChevronDown, FileText, Users } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Markdown from "react-markdown";

export const AuthorsSection = ({
  authorsByClub,
}: {
  authorsByClub: Record<string, Person[]>;
}) => {
  return (
    <div className="space-y-6">
      {Object.entries(authorsByClub).map(([club, authors]) => (
        <div key={club} className="space-y-3">
          {authors.length > 10 ? (
            <Collapsible>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {club} ({authors.length})
                </Badge>
                <CollapsibleTrigger className="hover:bg-accent rounded-full p-1">
                  <ChevronDown className="h-4 w-4 transition-transform" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
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
    </div>
  );
};

export const TopicsSection = ({ topics }: { topics: Topic[] }) => (
  <div className="space-y-2">
    {topics.map((topic) => (
      <div
        key={topic.name}
        className="flex flex-col gap-2 border border-primary/10 rounded-md p-3 bg-primary/5"
      >
        <span className="font-medium text-primary">{topic.name}</span>
        {topic.description.startsWith("{")
          ? JSON.parse(topic.description)[topic.name]
          : topic.description}
      </div>
    ))}
  </div>
);

export const RelatedPrintsSection = ({ prints }: { prints: Print[] }) => (
  <div className="space-y-2">
    {prints.map((print) => (
      <a
        href={`/process/${print.number}`}
        key={print.number}
        className="block p-3 border rounded-lg hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline">Nr {print.number}</Badge>
          <span className="text-xs text-muted-foreground">
            {print.documentType}
          </span>
        </div>
        <h3 className="text-sm text-primary line-clamp-2">{print.title}</h3>
      </a>
    ))}
  </div>
);

export const ProcessStagesSection = ({
  stages,
}: {
  stages: ProcessStage[];
}) => (
  <div className="space-y-4">
    {stages.map((stage, index) => (
      <div
        key={`${stage.stageName}-${stage.date}`}
        className="flex items-start gap-4 relative"
      >
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {index + 1}
          </div>
          {index < stages.length - 1 && (
            <div className="w-0.5 h-full bg-primary/30 absolute top-8 left-4 -z-10" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-lg text-primary">
            {stage.stageName}
          </div>
          <div className="text-sm text-muted-foreground mb-2">{stage.date}</div>
          {Array.isArray(stage.childStages) && stage.childStages.length > 0 && (
            <div className="ml-4 text-sm text-muted-foreground space-y-1">
              {stage.childStages.map((child) => (
                <div key={child.stageName} className="flex items-center gap-2">
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
);

// Add new TopicPrintsSection component
export const TopicPrintsSection = ({ prints }: { prints: Print[] }) => (
  <ScrollArea className="h-64">
    <div className="space-y-2 pr-4">
      {prints.map((print) => (
        <a
          href={`/process/${print.number}`}
          key={print.number}
          className="block p-3 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Nr {print.number}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {print.documentType}
            </span>
          </div>
          <h3 className="text-sm text-primary line-clamp-2">{print.title}</h3>
        </a>
      ))}
    </div>
  </ScrollArea>
);

// Add new SubjectsSection component
export const SubjectsSection = ({ subjects }: { subjects: Person[] }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {subjects.map((subject) => (
        <div
          key={subject.firstLastName}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
        >
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm">{subject.firstLastName}</span>
        </div>
      ))}
    </div>
  </div>
);

// Add new CommentsCarouselSection component
export const CommentsCarouselSection = ({
  comments,
}: {
  comments: Comment[];
}) => {
  if (comments.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        Opinie i komentarze ({comments.length})
      </h2>
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {comments.map((comment, index) => (
            <CarouselItem
              key={`${index}`}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <div className="border rounded-lg p-4 h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary">
                    {comment.author}
                  </span>
                  <Badge
                    variant={
                      comment.sentiment === "Pozytywny"
                        ? "default"
                        : comment.sentiment === "Negatywny"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {comment.sentiment}
                  </Badge>
                </div>
                {comment.organization && (
                  <span className="text-xs text-muted-foreground block mb-2">
                    ({comment.organization})
                  </span>
                )}
                <Markdown className="prose dark:prose-invert text-sm">
                  {comment.summary}
                </Markdown>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
