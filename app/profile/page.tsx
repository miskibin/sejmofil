'use client'

import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, ThumbsUp, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistance } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ChartContainer } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ReactionStats = Array<{
  emoji: string
  count: number
}>

export default function ProfilePage() {
  const { user } = useSupabaseSession()
  const [stats, setStats] = useState<ReactionStats>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return

    const loadStats = async () => {
      const { data } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('user_id', user.id)

      if (data) {
        const counts: Record<string, number> = {}
        data.forEach(({ emoji }) => {
          counts[emoji] = (counts[emoji] || 0) + 1
        })

        setStats(
          Object.entries(counts)
            .map(([emoji, count]) => ({ emoji, count }))
            .sort((a, b) => b.count - a.count)
        )
      }
    }

    loadStats()
  }, [user?.id])

  if (!user) return null

  const totalReactions = stats.reduce((sum, { count }) => sum + count, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Twoje reakcje ({totalReactions})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 ? (
              <ChartContainer
                className="h-[350px] w-full"
                config={{
                  // Required chart configuration
                  type: {
                    label: 'Bar',
                    color: 'hsl(var(--primary))',
                  },
                  value: {
                    label: 'Liczba reakcji',
                  },
                  item: {
                    label: 'Reakcja',
                  },
                 
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="emoji"
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tick={{ fontSize: 20 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {payload[0].payload.emoji}
                                </span>
                                <span className="font-bold">
                                  {payload[0].value} reakcji
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nie masz jeszcze żadnych reakcji
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
