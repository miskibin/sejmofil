'use client'

import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, MessageCircle, ThumbsUp, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistance } from 'date-fns'
import { pl } from 'date-fns/locale'

type UserReactionWithStatement = {
  emoji: string
  statement: {
    id: number
    text: string
    speaker_name: string
    official_topic: string
    statement_ai?: {
      topic: string
      summary_tldr: string
    }
  }
}

export default function ProfilePage() {
  const { user } = useSupabaseSession()
  const [reactionStats, setReactionStats] = useState({
    totalReactions: 0,
    mostUsedEmoji: '👍',
    latestReactions: [] as UserReactionWithStatement[],
  })
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return

    const loadUserActivity = async () => {
      const { data: statsData, error } = await supabase
        .from('reactions')
        .select(
          `
          emoji,
          statement:statement (
            id,
            text,
            speaker_name,
            official_topic,
            statement_ai (
              topic,
              summary_tldr
            )
          )
        `
        )
        .eq('user_id', user.id)
        .limit(5)
      console.log( error)
      if (statsData) {
        const emojiCounts = statsData.reduce(
          (acc, { emoji }) => {
            acc[emoji] = (acc[emoji] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )

        const mostUsedEmoji =
          Object.entries(emojiCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          '👍'

        setReactionStats({
          totalReactions: statsData.length,
          mostUsedEmoji,
          latestReactions: statsData as unknown as UserReactionWithStatement[],
        })
      }
    }

    loadUserActivity()
  }, [user?.id])

  if (!user) return null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-2">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {user.user_metadata.preferred_username || user.email}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Dołączył(a){' '}
                {formatDistance(new Date(user.created_at), new Date(), {
                  locale: pl,
                })}{' '}
                temu
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Reaction Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Statystyki reakcji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Wszystkie reakcje
                </p>
                <p className="text-2xl font-bold">
                  {reactionStats.totalReactions}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Najczęstsza reakcja
                </p>
                <p className="text-2xl">{reactionStats.mostUsedEmoji}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Ostatnie reakcje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reactionStats.latestReactions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{item.statement.speaker_name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.statement.text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">

                      {item.statement.statement_ai?.topic && (
                        <>
                          <span>•</span>
                          <span>{item.statement.statement_ai.topic}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
