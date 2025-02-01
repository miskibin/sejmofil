import { getAllProcessPrints, getAllTopics } from '@/lib/queries/print'
import ProcessClientPage from './client-page'

export default async function ProcessesPage() {
  const [initialPrints, topics] = await Promise.all([
    getAllProcessPrints(0, 20),
    getAllTopics(),
  ])

  return (
    <ProcessClientPage
      initialPrints={initialPrints}
      initialTopics={topics.slice(0, 10)} // Take top 10 most common topics
    />
  )
}
