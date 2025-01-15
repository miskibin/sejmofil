import Link from "next/link";
import { cn } from "@/lib/utils";

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
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
