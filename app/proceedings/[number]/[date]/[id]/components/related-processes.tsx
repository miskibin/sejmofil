import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Tag } from 'lucide-react'
import Link from 'next/link'
import { ProcessInfo } from '@/lib/queries/pointProcesses'

interface RelatedProcessesProps {
  processes: ProcessInfo[]
}

export function RelatedProcesses({ processes }: RelatedProcessesProps) {
  if (processes.length === 0) {
    return null
  }

  return (
    <Card className="flex flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-full bg-blue-500/10 p-2">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold">Procesy legislacyjne</h3>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {processes.map((process) => (
          <Link
            key={process.number}
            href={`/processes/${process.number}`}
            className="group rounded-lg border p-3 transition-all hover:border-primary hover:bg-muted/50"
          >
            <div className="space-y-2">
              {/* Process number and type */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {process.number}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {process.documentType}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <h4 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                {process.title}
              </h4>

              {/* Latest stage */}
              {process.latestStage && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{process.latestStage.name}</span>
                </div>
              )}

              {/* Topics */}
              {process.topics && process.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {process.topics.slice(0, 3).map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {process.topics.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{process.topics.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
