import { createClient } from '@/utils/supabase/server'

type TopicCount = {
  id: number
  topic: string
  proceeding_id: number
  date: string
  count: number
  uuid: string
}

export async function getTopDiscussedTopics(
  limit: number
): Promise<TopicCount[]> {
  const supabase = createClient()
  const { data, error } = await (await supabase)
    .rpc('get_top_discussed_topics')
    .limit(limit)

  if (error) {
    console.error('Error fetching top discussed topics:', error)
    return []
  }

  const topicsWithUUID =
    (data as TopicCount[])?.map((topic: TopicCount) => ({
      ...topic,
      uuid: crypto.randomUUID(),
    })) || []
  return topicsWithUUID
}
