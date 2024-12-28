import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import { ChevronRight, MessagesSquare } from "lucide-react";
  import Link from "next/link";
  
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
        <PopoverContent className="w-96 p-4 border-2 border-primary">
          <div className="max-h-[60vh] overflow-y-auto">
            {description && (
              <p className="text-sm text-muted-foreground mb-3 break-words">{description}</p>
            )}
            
            {urls && urls.length > 0 && (
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <Link
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline break-all"
                  >
                    {url}
                  </Link>
                ))}
              </div>
            )}
  
            {aiPrompt && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MessagesSquare className="h-3 w-3" />
                  <span>Prompt AI</span>
                </div>
                <p className="text-sm italic break-words">{aiPrompt}</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }