import { getProceedingDetails } from '@/lib/supabase/getProceedingDetails'
import { sortPointsByImportance, truncateText } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { CardWrapper } from './ui/card-wrapper'

async function getLatestPoints() {
  const proceeding = await getProceedingDetails(26) // Latest proceeding number
  const points = proceeding.proceeding_day.flatMap((day, dayIndex) =>
    day.proceeding_point_ai.map((point) => ({
      ...point,
      date: day.date,
      dayNumber: dayIndex + 1,
      pointIndex: point.id % 9,
      proceedingNumber: proceeding.number,
    }))
  )
  return sortPointsByImportance(points).slice(0, 2)
}

export default async function LatestInterestingPoints() {
  const points = await getLatestPoints()

  return (
    <>
      {points.map((point) => {
        const imageUrl = `https://db.msulawiak.pl/storage/v1/object/public/${point.proceedingNumber}_${point.dayNumber}/image${point.pointIndex}.jpg`

        return (
          <Link
            key={point.id}
            href={`/proceedings/${point.proceedingNumber}/${point.date}/${point.id}`}
            className="group relative block w-full"
          >
            <CardWrapper
              className="h-full"
              subtitle={point.topic.split('|')[0]}
              title={point.topic.split('|')[1]}
              showGradient={false}
              headerIcon={
                <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />
              }
              imageSrc={imageUrl}
            >
              <p className="text-sm text-gray-500">
                {truncateText(point.summary_tldr, 200)}
              </p>
            </CardWrapper>
          </Link>
        )
      })}
    </>
  )
}
