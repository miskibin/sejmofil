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

      if (isVoting) {
        return
      }

      setIsVoting(true)
      setError(null) // Clear any previous errors
      
      try {
        // Optimistic update for better UX
        const optimisticVotes = { ...votes }
        const isRemovingVote = userVote === voteType
        
        // Adjust vote counts optimistically
        if (isRemovingVote) {
          optimisticVotes[`${voteType}votes` as keyof typeof optimisticVotes] -= 1
        } else {
          // If changing vote type, decrease the other type
          if (userVote) {
            optimisticVotes[`${userVote}votes` as keyof typeof optimisticVotes] -= 1
          }
          optimisticVotes[`${voteType}votes` as keyof typeof optimisticVotes] += 1
        }
        
        // Update UI immediately
        setVotes(optimisticVotes)
        setUserVote(isRemovingVote ? null : voteType)
        
        // Send to server
        const result = await toggleVote(pointId, user.id, voteType)
        
        if (result.success) {
          // Get the actual counts from server to ensure consistency
          const serverCounts = await getVoteCounts(pointId)
          setVotes(serverCounts)
          
          // Update user vote state based on the action
          if (isRemovingVote) {
            setUserVote(null)
          } else {
            setUserVote(voteType)
          }
        } else {
          // Revert optimistic update on error
          setError(result.error || 'Failed to save vote. Please try again.')
          const revertCounts = await getVoteCounts(pointId)
          setVotes(revertCounts)
          const revertUserVote = await getUserVote(pointId, user.id)
          setUserVote(revertUserVote)
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error in handleVote:', error)
        setError('An unexpected error occurred. Please try again.')
        
        // Revert to server state
        try {
          const revertCounts = await getVoteCounts(pointId)
          setVotes(revertCounts)
          const revertUserVote = await getUserVote(pointId, user.id)
          setUserVote(revertUserVote)
        } catch (revertError) {
          console.error('Failed to revert vote state:', revertError)
        }
      } finally {
        setIsVoting(false)
      }
    },
    [user, pointId, isVoting, userVote, votes]
  )

  return (
    <>
      <div className="flex flex-col gap-2">
        {error && (
          <div className="text-xs text-red-500 px-2">
            {error}
          </div>
        )}
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
                (isVoting || isLoading) && 'opacity-50'
              )}
              onClick={(e) => {
                e.preventDefault()
                setError(null) // Clear error on new attempt
                handleVote(type as 'up' | 'down')
              }}
              disabled={isVoting || isLoading}
            >
              <ArrowUp
                className={cn('w-4 h-4 mr-2', type === 'down' && 'rotate-180')}
              />
              <span>
                {votes && votes[`${type}votes` as 'upvotes' | 'downvotes'] !== undefined
                  ? votes[`${type}votes` as 'upvotes' | 'downvotes']
                  : 0}
              </span>
            </Button>
          ))}
        </div>
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
