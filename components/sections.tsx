import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Print, PrintAuthor, Topic, Comment, ProcessStage } from "@/lib/types";
import { ChevronRight, User, Building2 } from 'lucide-react';

export const AuthorsSection = ({
  authorsByClub,
}: {
  authorsByClub: Record<string, PrintAuthor[]>;
}) => (
  <div className="space-y-4">
    {Object.entries(authorsByClub).map(([club, authors]) => (
      <div key={club} className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">{club}</span>
        </div>
        <div className="pl-6 space-y-1">
          {authors.map((author) => (
            <div key={author.firstLastName} className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
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
        className="flex items-center justify-between border border-primary/10 rounded-md p-2 hover:bg-accent transition-colors"
      >
        <Badge variant="outline" className="bg-primary/5">
          {topic.name}
        </Badge>
        {topic.description && (
          <span className="text-sm text-muted-foreground">{topic.description}</span>
        )}
      </div>
    ))}
  </div>
);

export const RelatedPrintsSection = ({ prints }: { prints: Print[] }) => (
  <ScrollArea className="h-64">
    <div className="space-y-2 pr-4">
      {prints.map((print) => (
        <Card key={print.number} className="p-3 hover:bg-accent transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-primary">{print.title}</h3>
              <p className="text-sm text-muted-foreground">Numer: {print.number}</p>
            </div>
            <Badge variant="secondary">{print.documentType}</Badge>
          </div>
        </Card>
      ))}
    </div>
  </ScrollArea>
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

export const ProcessStagesSection = ({ stages }: { stages: ProcessStage[] }) => (
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
          <div className="font-medium text-lg text-primary">{stage.stageName}</div>
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

