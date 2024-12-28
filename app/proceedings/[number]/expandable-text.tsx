// Components folder: components/ExpandableText.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";

export const ExpandableText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > 500;

  if (!shouldTruncate) return <p>{text}</p>;

  return (
    <div>
      {/* <p className={!isExpanded ? "line-clamp-4" : undefined}> */}
      <Markdown
        className={`prose dark:prose-invert max-w-none mt-4 ${
          !isExpanded ? "line-clamp-4" : ""
        }`}
      >
        {text}
      </Markdown>
      {/* </p> */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 flex items-center gap-2"
      >
        {isExpanded ? (
          <>
            Pokaż mniej <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Pokaż więcej <ChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};