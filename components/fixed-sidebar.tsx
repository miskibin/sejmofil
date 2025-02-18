import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface SidebarCardProps {
  children: ReactNode;
  className?: string;
}

export default function SidebarCard({
  children,
  className = "",
}: SidebarCardProps) {
  return (
    <Card
      className={`rounded-2xl border border-border bg-inherit shadow-none p-4 ${className}`}
    >
      {children}
    </Card>
  );
}

// Optional - A header component to match the style in the image
interface SidebarCardHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SidebarCardHeader({
  title,
  actionLabel,
  onAction,
}: SidebarCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/90"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Optional - A tag list component to match the style in the image
interface SidebarCardTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export function SidebarCardTags({ tags, onTagClick }: SidebarCardTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
