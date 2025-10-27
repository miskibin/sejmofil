import { getAllProcessPrints } from '@/lib/queries/print'
import ProcessClientPage from './client-page'
import { getBatchProcessVoteCounts } from '@/lib/supabase/processVotes'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Procesy legislacyjne | Sejmofil',
  description: 'Śledź przebieg procesów legislacyjnych w Sejmie. Zobacz wszystkie etapy prac nad ustawami i głosowania.',
}

export default async function ProcessesPage() {
  const prints = await getAllProcessPrints();

  // Batch fetch all vote counts in a single query to avoid cookie() concurrency issues
  const processIds = prints.map(print => parseInt(print.number))
  const voteCountsMap = await getBatchProcessVoteCounts(processIds)
  
  // Map the results back to prints
  const printsWithVotes = prints.map(print => ({
    ...print,
    votes: voteCountsMap.get(parseInt(print.number)) || { upvotes: 0, downvotes: 0 }
  }));

  return <ProcessClientPage prints={printsWithVotes} />;
}
