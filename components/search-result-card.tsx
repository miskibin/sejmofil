import Link from "next/link";
import { cn } from "@/lib/utils";
import { highlightText } from "@/lib/utils/highlight-text";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { CalendarDays } from "lucide-react";
import { SearchResultItem } from "@/lib/types/search";

interface SearchResultCardProps extends SearchResultItem {
  className?: string;
  searchQuery?: string;
}

export function SearchResultCard({
  title,
  date,
  metadata,
  content,
  href,
  className,
  searchQuery,
}: SearchResultCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block py-4 px-0 sm:px-2 hover:bg-primary/10 rounded-lg transition-colors border-b space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {metadata.icon}
          <span>{metadata.text}</span>
        </div>
        {date && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <time>{new Date(date).toLocaleDateString("pl-PL")}</time>
          </div>
        )}
      </div>

      <h3
        className="font-medium group-hover:text-primary transition-colors"
        dangerouslySetInnerHTML={{
          __html: searchQuery ? highlightText(title, searchQuery) : title,
        }}
      />

      {content && (
        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-2">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {searchQuery ? highlightText(content, searchQuery) : content}
          </ReactMarkdown>
        </div>
      )}
    </Link>
  );
}
