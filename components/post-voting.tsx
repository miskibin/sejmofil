'use client'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useCallback, useState, useEffect, useRef } from 'react'
import { toggleVote, getUserVote, getVoteCounts } from '@/lib/supabase/votes'
import { cn } from '@/lib/utils'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { LoginDialog } from './login-dialog'

export function PostVoting({
  pointId,
  initialVotes,
}: {
  pointId: number
  initialVotes: { upvotes: number; downvotes: number }
}) {
  const { user } = useSupabaseSession()
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track if data has been loaded from the server
  const hasLoadedData = useRef(false)

  // Load user vote and fetch updated counts
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        // Always start with initialVotes to prevent flickering
        if (!hasLoadedData.current) {
          setVotes(initialVotes)
        }

        // Get vote counts from the database
        const counts = await getVoteCounts(pointId)

        if (isMounted && counts) {
          // Only update if we have valid data and component is still mounted
          setVotes(counts)
          hasLoadedData.current = true
        }

        // If user is logged in, get their vote
        if (user && isMounted) {
          const vote = await getUserVote(pointId, user.id)
          if (isMounted) {
            setUserVote(vote)
          }
        }
      } catch (error) {
        console.error(`Error loading vote data for pointId ${pointId}:`, error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    setIsLoading(true)
    loadData()

    return () => {
      isMounted = false
    }
  }, [pointId, user, initialVotes])
  const handleVote = useCallback(
    async (voteType: 'up' | 'down') => {
      if (!user) {
        setShowLoginDialog(true)
        return
      }

      if (isVoting) return

      setIsVoting(true)
      setError(null)

      try {
        const isRemovingVote = userVote === voteType
        const optimisticVotes = { ...votes }

        // Optimistic update
        if (isRemovingVote) {
          optimisticVotes[`${voteType}votes`] -= 1
        } else {
          if (userVote) optimisticVotes[`${userVote}votes`] -= 1
          optimisticVotes[`${voteType}votes`] += 1
        }

        setVotes(optimisticVotes)
        setUserVote(isRemovingVote ? null : voteType)

        const result = await toggleVote(pointId, user.id, voteType)

        if (result.success) {
          const serverCounts = await getVoteCounts(pointId)
          setVotes(serverCounts)
        } else {
          setError(result.error || 'Failed to save vote')
          const [revertCounts, revertUserVote] = await Promise.all([
            getVoteCounts(pointId),
            getUserVote(pointId, user.id),
          ])
          setVotes(revertCounts)
          setUserVote(revertUserVote)
        }
      } catch (error) {
        console.error('Vote error:', error)
        setError('An unexpected error occurred')
        const [revertCounts, revertUserVote] = await Promise.all([
          getVoteCounts(pointId),
          getUserVote(pointId, user.id),
        ])
        setVotes(revertCounts)
        setUserVote(revertUserVote)
      } finally {
        setIsVoting(false)
      }
    },
    [user, pointId, isVoting, userVote, votes]
  )

  return (
    <>
      <div className="flex items-center gap-1.5">
        {error && <div className="text-xs text-red-500 px-2">{error}</div>}

        {/* Upvote Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 px-3 py-1 h-9 rounded-full transition-all',
            userVote === 'up'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : 'hover:bg-primary/10',
            (isVoting || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
          onClick={(e) => {
            e.preventDefault()
            setError(null)
            handleVote('up')
          }}
          disabled={isVoting || isLoading}
        >
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm font-medium min-w-[1.5rem] text-center">{votes?.upvotes ?? 0}</span>
        </Button>

        {/* Downvote Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 px-3 py-1 h-9 rounded-full transition-all',
            userVote === 'down'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md'
              : 'hover:bg-destructive/10',
            (isVoting || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
          onClick={(e) => {
            e.preventDefault()
            setError(null)
            handleVote('down')
          }}
          disabled={isVoting || isLoading}
        >
          <ArrowUp className="w-4 h-4 rotate-180" />
          <span className="text-sm font-medium min-w-[1.5rem] text-center">{votes?.downvotes ?? 0}</span>
        </Button>
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
