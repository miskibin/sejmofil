import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { PrintShort } from "@/lib/types/print";

interface PrintCardProps {
  print: PrintShort;
}

export function PrintCard({ print }: PrintCardProps) {
  return (
    <Link
      href={`/prints/${print.number}`}
      className="block p-4 hover:bg-accent rounded-lg transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">Druk nr {print.number}</span>
          {print.documentDate && (
            <time className="text-sm text-muted-foreground">
              {new Date(print.documentDate).toLocaleDateString("pl-PL")}
            </time>
          )}
        </div>
        <h3 className="text-lg font-semibold">{print.title}</h3>
        {print.summary && (
          <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-2">
            <ReactMarkdown>{print.summary}</ReactMarkdown>
          </div>
        )}
      </div>
    </Link>
  );
}
