'use client'

import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, ThumbsUp, User, ArrowLeft, LogOut } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type ReactionStats = Array<{
  emoji: string
  count: number
}>

export default function ProfilePage() {
  const client = createClient()
  const { user } = useSupabaseSession()
  const [stats, setStats] = useState<ReactionStats>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user?.id) return

    const loadStats = async () => {
      const { data } = await supabase
        .from('reaction') // Changed from 'reactions' to 'reaction'
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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="backdrop-blur-sm bg-white/80">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <Link href="/" passHref>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut()
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="text-xs">
                Użytkownik
              </Badge>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-bold text-primary">
                  {user.user_metadata.name
                    ? `${user.user_metadata.name} ${user.user_metadata.last_name || ''}`
                    : user.user_metadata.preferred_username || user.email}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <p>
                    Dołączył(a){' '}
                    {formatDistance(new Date(user.created_at), new Date(), {
                      locale: pl,
                    })}{' '}
                    temu
                  </p>
                </div>
              </div>

              <div className="border-t pt-6 px-0 mx-0 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Twoje reakcje ({totalReactions})
                </h3>
                <div className="h-[300px] max-w-[500px]">
                  {' '}
                  {/* Container for chart */}
                  {stats.length > 0 ? (
                    <ChartContainer
                      className="min-h-[300px]"
                      config={{
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
                          width={500}
                          height={300}
                          margin={{
                            top: 20,
                            right: 20,
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
                    <p className="text-muted-foreground text-sm">
                      Nie masz jeszcze żadnych reakcji
                    </p>
                  )}
                </div>
              </div>

              {/* Placeholder sections for future content */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Obserwowane osoby
                </h3>
                <p className="text-muted-foreground text-sm">
                  Funkcja w przygotowaniu...
                </p>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Historia aktywności
                </h3>
                <p className="text-muted-foreground text-sm">
                  Funkcja w przygotowaniu...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
