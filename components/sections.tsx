import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Print, PrintAuthor, Topic, Comment, ProcessStage } from "@/lib/types";
import { ChevronRight, User } from "lucide-react";

export const AuthorsSection = ({
  authorsByClub,
}: {
  authorsByClub: Record<string, PrintAuthor[]>;
}) => (
  <div className="space-y-6">
    {Object.entries(authorsByClub).map(([club, authors]) => (
      <div key={club} className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {club}
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
      </div>
    ))}
  </div>
);

export const TopicsSection = ({ topics }: { topics: Topic[] }) => (
  <div className="space-y-2">
    {topics.map((topic) => (
      <div
        key={topic.name}
        className="flex flex-col gap-2 border border-primary/10 rounded-md p-3 bg-primary/5"
      >
        <span className="font-medium text-primary">{topic.name}</span>
        {topic.description && (
          <span className="text-sm text-muted-foreground">
            {topic.description}
          </span>
        )}
      </div>
    ))}
  </div>
);

export const RelatedPrintsSection = ({ prints }: { prints: Print[] }) => (
  <div className="space-y-2">
    {prints.map((print) => (
      <Card key={print.number} className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Nr {print.number}</Badge>
            <Badge variant="secondary">{print.documentType}</Badge>
          </div>
          <h3 className="text-sm text-primary">{print.title}</h3>
        </div>
      </Card>
    ))}
  </div>
);

export const CommentsSection = ({ comments }: { comments: Comment[] }) => (
  <ScrollArea className="h-64">
    <div className="space-y-4 pr-4">
      {comments.map((comment) => (
        <Card
          key={`${comment.author}-${comment.organization}`}
          className="p-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-primary">{comment.author}</span>
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
            <span className="text-sm text-muted-foreground block mb-2">
              ({comment.organization})
            </span>
          )}
          <p className="text-sm">{comment.summary}</p>
        </Card>
      ))}
    </div>
  </ScrollArea>
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
