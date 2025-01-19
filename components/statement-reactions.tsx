"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { LoginDialog } from "./login-dialog";
import { useSupabaseSession } from "@/lib/hooks/use-supabase-session";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

const REACTIONS = [
  { emoji: "👍", label: "Popieram" },
  { emoji: "👎", label: "Nie popieram" },
  { emoji: "😮", label: "Zaskoczenie" },
  { emoji: "❤️", label: "Świetne" },
  { emoji: "😂", label: "Zabawne" },
];

// Mock reaction counts
const mockReactionCounts: Record<string, number> = REACTIONS.reduce((acc, { emoji }) => ({
  ...acc,
  [emoji]: Math.floor(Math.random() * 50),
}), {});

interface StatementReactionsProps {
  statementId: number;
}

export function StatementReactions({ statementId }: StatementReactionsProps) {
  console.log("🚀 ~ StatementReactions ~ statementId:", statementId)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { session } = useSupabaseSession();

  const handleReactionClick = (emoji: string) => {
    if (!session && process.env.NODE_ENV !== "development") {
      setShowLoginDialog(true);
      return;
    }
    
    if (selectedReaction === emoji) {
      setSelectedReaction(null);
      return;
    }

    setSelectedReaction(emoji);
    // TODO: Add API call to save reaction
  };

  const handleReactionTriggerClick = () => {
    if (!session && process.env.NODE_ENV !== "development") {
      setShowLoginDialog(true);
      return;
    }
  };

  // Calculate total reactions and top emojis
  const totalReactions = Object.values(mockReactionCounts).reduce((a, b) => a + b, 0);
  const topTwoReactions = Object.entries(mockReactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([emoji]) => emoji);

  return (
    <>
      <Popover>
        <div className="flex items-center gap-2">
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 px-1.5 ${
                !selectedReaction ? "text-muted-foreground" : ""
              }`}
              onClick={handleReactionTriggerClick}
            >
              {selectedReaction ? (
                <span className="text-lg">{selectedReaction}</span>
              ) : (
                <SmilePlus className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>

          {/* Show reaction counts */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex gap-0.5">
              {topTwoReactions.map(emoji => (
                <span key={emoji} className="text-base">{emoji}</span>
              ))}
            </div>
            <span>{totalReactions}</span>
          </div>
        </div>

        {(session || process.env.NODE_ENV === "development") && (
          <PopoverContent 
            className="w-auto p-0.5" 
            sideOffset={5}
            align="start"
            alignOffset={-5}
          >
            <div className="flex gap-0.5">
              {REACTIONS.map(({ emoji, label }) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className={`px-1 py-0.5 ${
                    selectedReaction === emoji ? "bg-accent/50 hover:bg-accent/70" : ""
                  }`}
                  onClick={() => handleReactionClick(emoji)}
                >
                  <span 
                    className="text-xl" 
                    title={`${label} (${mockReactionCounts[emoji]})`}
                  >
                    {emoji}
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>

      {showLoginDialog && (
        <LoginDialog 
          defaultOpen={true}
          onOpenChange={(open) => !open && setShowLoginDialog(false)}
          message="Musisz się zalogować by dodawać reakcje"
        />
      )}
    </>
  );
}
