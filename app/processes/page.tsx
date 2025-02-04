import { getAllProcessPrints } from '@/lib/queries/print'
import ProcessClientPage from './client-page'

export default async function ProcessesPage() {
  const prints = await getAllProcessPrints()
  return <ProcessClientPage prints={prints} />
}
