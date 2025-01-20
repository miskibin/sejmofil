import { CardWrapper } from '@/components/ui/card-wrapper'
import { getTopDiscussedTopics } from '@/lib/supabase/queries'
import Link from 'next/link'

export default async function RecentPoints() {
  const topics = await getTopDiscussedTopics(7)

  return (
    <CardWrapper
      title="Ostatnio omawiane"
      subtitle="Punkty obrad"
      showGradient={true}
      showMoreLink="/proceedings"
    >
      <div className="space-y-5 py-4">
        {topics.map((topic, index) => {
          const [category, title] = topic.topic.split(' | ')

          return (
            <div key={index + topic.id} className="space-y-1">
              <Link
                href={`/proceedings/${topic.proceeding_id}/${topic.date}/${topic.id}`}
              >
                <div className="flex items-start gap-x-3">
                  <span className="flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-lg bg-primary text-center font-semibold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {category} • {topic.count} wypowiedzi
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </CardWrapper>
  )
}
