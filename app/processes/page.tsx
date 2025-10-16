import { getAllProcessPrints } from '@/lib/queries/print'
import ProcessClientPage from './client-page'
import {
  getProcessVoteCounts,
  ProcessVoteCount,
} from '@/lib/supabase/processVotes'

export default async function ProcessesPage() {
  const prints = await getAllProcessPrints()

  // Alternative approach: Get all vote counts first, then map them
  const voteCountsPromises = prints.map((print) =>
    getProcessVoteCounts(parseInt(print.number))
  )

  const voteCounts = await Promise.all(voteCountsPromises)

  // Map the results back to prints in original order
  const printsWithVotes = prints.map((print, index) => ({
    ...print,
    votes: voteCounts[index],
  }))

  return <ProcessClientPage prints={printsWithVotes} />
}
