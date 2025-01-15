import Link from "next/link";
import { cn } from "@/lib/utils";
import { highlightText } from "@/lib/utils/highlight-text";
import ReactMarkdown from "react-markdown";

interface SearchResultCardProps {
  href: string;
  title: string;
  description?: string;
  metadata?: string;
  className?: string;
}

export function SearchResultCard({
  href,
  title,
  description,
  metadata,
  className,
  searchQuery,
}: SearchResultCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block p-4 hover:bg-accent rounded-lg transition-colors border",
        className
      )}
    >
      <div className="space-y-2">
        {metadata && (
          <div className="text-sm text-muted-foreground">{metadata}</div>
        )}
        <h3 
          className="font-medium"
          dangerouslySetInnerHTML={{
            __html: searchQuery ? highlightText(title, searchQuery) : title,
          }}
        />
        {description && (
          <p 
            className="text-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: searchQuery ? highlightText(description, searchQuery) : description,
            }}
          />
        )}
      </div>
    </Link>
  );
}
