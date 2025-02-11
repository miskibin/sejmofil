'use client'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import { toggleVote, getUserVote, getVoteCounts } from '@/lib/supabase/votes'
import { cn } from '@/lib/utils'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { LoginDialog } from './login-dialog'

export function PostVoting({
  pointId,
  initialVotes = { upvotes: 0, downvotes: 0 },
}: {
  pointId: number
  initialVotes: { upvotes: number; downvotes: number }
}) {
  const { user } = useSupabaseSession()
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    if (user) {
      Promise.all([getUserVote(pointId, user.id), getVoteCounts(pointId)]).then(
        ([vote, counts]) => {
          setUserVote(vote)
          setVotes(counts)
        }
      )
    } else {
      // When not logged in, just fetch vote counts
      getVoteCounts(pointId).then((counts) => setVotes(counts))
    }
  }, [pointId, user])

  const handleVote = useCallback(
    async (voteType: 'up' | 'down') => {
      if (!user) {
        setShowLoginDialog(true)
        return
      }

      if (isVoting) return

      setIsVoting(true)
      try {
        const result = await toggleVote(pointId, user.id, voteType)
        if (result.success) {
          setUserVote((prev) => (prev === voteType ? null : voteType))
          const newCounts = await getVoteCounts(pointId)
          setVotes(newCounts)
        }
      } finally {
        setIsVoting(false)
      }
    },
    [user, pointId, isVoting]
  )

  return (
    <>
      <div className="flex gap-2">
        {['up', 'down'].map((type) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              userVote === type
                ? type === 'up'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-white'
                : type === 'up'
                  ? 'bg-primary/10 hover:bg-primary/20'
                  : 'bg-destructive/10 hover:bg-destructive/20 ',
              isVoting && 'opacity-50'
            )}
            onClick={(e) => {
              e.preventDefault()
              handleVote(type as 'up' | 'down')
            }}
            disabled={isVoting}
          >
            <ArrowUp
              className={cn('w-4 h-4 mr-2', type === 'down' && 'rotate-180')}
            />
            <span>{votes[`${type}votes` as 'upvotes' | 'downvotes']}</span>
          </Button>
        ))}
      </div>

      <LoginDialog
        defaultOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        trigger={<span></span>}
        message="Zaloguj się aby oddać głos"
      />
    </>
  )
}
