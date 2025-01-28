'use client'

import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { ReactionCount, getReactions, getUserReaction, toggleReaction } from '@/lib/supabase/reactions'
import { useEffect, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import { LoginDialog } from './login-dialog'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const REACTIONS = [
  { emoji: '👍', label: 'Popieram' },
  { emoji: '👎', label: 'Nie popieram' },
  { emoji: '😮', label: 'Zaskoczenie' },
  { emoji: '❤️', label: 'Świetne' },
  { emoji: '😂', label: 'Zabawne' },
] as const

export function StatementReactions({ statementId }: { statementId: number }) {
  const { session } = useSupabaseSession()
  const [reactions, setReactions] = useState<ReactionCount[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!statementId) return
    
    const load = async () => {
      const [reactionData, userReaction] = await Promise.all([
        getReactions(statementId),
        session?.user?.id ? getUserReaction(statementId, session.user.id) : null
      ])
      setReactions(reactionData)
      setSelectedEmoji(userReaction)
    }
    
    load()
  }, [statementId, session?.user?.id])

  const handleReactionClick = async (emoji: string) => {
    const userId = session?.user?.id
    if (!userId) {
      setShowLoginDialog(true)
      setIsOpen(false)
      return
    }

    const result = await toggleReaction(statementId, userId, emoji)
    if (!result.success) {
      setError(result.error ?? null)
      return
    }

    const [newReactions] = await Promise.all([
      getReactions(statementId),
      setSelectedEmoji(selectedEmoji === emoji ? null : emoji)
    ])
    setReactions(newReactions)
    setIsOpen(false)
    setError(null)
  }

  const totalReactions = reactions.reduce((sum, { count }) => sum + count, 0)
  const topEmojis = reactions.slice(0, 2).map(r => r.emoji)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-1.5">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`group flex h-7 items-center gap-1 px-1.5 transition-all duration-200 hover:scale-105 
              ${selectedEmoji ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {selectedEmoji ? (
              <>
                <span className="text-lg duration-300 animate-in zoom-in-50">{selectedEmoji}</span>
                <span className="text-xs font-medium capitalize opacity-90">
                  {REACTIONS.find(r => r.emoji === selectedEmoji)?.label}
                </span>
              </>
            ) : (
              <SmilePlus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            )}
          </Button>
        </PopoverTrigger>

        {totalReactions > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex items-center -space-x-1">
              {topEmojis.map((emoji) => (
                <span
                  key={emoji}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-base"
                >
                  {emoji}
                </span>
              ))}
            </div>
            <span className="text-xs">{totalReactions}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-full left-0 mb-2 text-xs text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}

      <PopoverContent
        className="w-auto p-0.5 duration-200 animate-in fade-in-0 zoom-in-95"
        sideOffset={5}
        align="start"
        alignOffset={-5}
      >
        <div className="flex gap-0.5">
          {REACTIONS.map(({ emoji, label }) => (
            <Button
              key={emoji}
              variant="ghost"
              className={`group px-1 py-0.5 transition-all duration-200 hover:scale-110 ${
                selectedEmoji === emoji ? 'bg-blue-50 dark:bg-blue-950' : ''
              }`}
              onClick={() => handleReactionClick(emoji)}
            >
              <span className="text-xl" title={`${label} (${reactions.find(r => r.emoji === emoji)?.count || 0})`}>
                {emoji}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>

      {showLoginDialog && (
        <LoginDialog
          defaultOpen={true}
          onOpenChange={(open) => setShowLoginDialog(open)}
          message="Musisz się zalogować by dodawać reakcje"
        />
      )}
    </Popover>
  )
}
