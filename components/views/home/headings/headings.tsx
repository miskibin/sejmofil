import SessionCalendar from '@/components/calendar'
import HotTopics from '@/components/hot-topics'
import { DidYouKnow } from '../did-you-know/did-you-know'

export function Headings() {
  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 sm:col-span-6 lg:col-span-9 lg:grid-cols-2"
        data-umami-event="hot-topics-view"
      >
        <HotTopics />
        <SessionCalendar />
      </div>
      <div
        className="sm:col-span-3 lg:col-span-3 lg:row-span-2"
        data-umami-event="did-you-know-view"
      >
        <DidYouKnow />
      </div>
    </>
  )
}
