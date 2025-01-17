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

interface StatementReactionsProps {
  statementId: number;
}

export function StatementReactions({ statementId }: StatementReactionsProps) {
  console.log("🚀 ~ StatementReactions ~ statementId:", statementId)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { session } = useSupabaseSession();

  const handleReactionClick = (emoji: string) => {
    if (!session) {
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
    if (!session) {
      setShowLoginDialog(true);
      return;
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleReactionTriggerClick}
          >
            {selectedReaction ? (
              <span className="text-lg">{selectedReaction}</span>
            ) : (
              <SmilePlus className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        {session && (
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-2">
              {REACTIONS.map(({ emoji, label }) => (
                <Button
                  key={emoji}
                  variant={selectedReaction === emoji ? "default" : "ghost"}
                  className="px-3 py-2"
                  onClick={() => handleReactionClick(emoji)}
                >
                  <span className="text-xl" title={label}>{emoji}</span>
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
