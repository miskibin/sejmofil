import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronRight, MessagesSquare } from "lucide-react";

interface SourcePopoverProps {
  description?: string;
  urls?: string[];
  aiPrompt?: string;
}

export function SourcePopover({ description, urls, aiPrompt }: SourcePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="border rounded-full p-1 px-3 flex items-center space-x-1 transition-colors hover:bg-gray-50">
          <span>źródło</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        
        {urls && urls.length > 0 && (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline "
              >
                {url}
              </a>
            ))}
          </div>
        )}

        {aiPrompt && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <MessagesSquare className="h-3 w-3" />
              <span>Prompt AI</span>
            </div>
            <p className="text-sm italic">{aiPrompt}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
