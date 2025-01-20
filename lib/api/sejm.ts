export interface VotingResult {
  abstain: number
  date: string
  description: string
  kind: string
  no: number
  notParticipating: number
  sitting: number
  yes: number
  sittingDay: number
  term: number
  title: string
  topic: string
  totalVoted: number
  votes: Array<{
    MP: number
    club: string
    firstName: string
    lastName: string
    secondName?: string
    vote: 'YES' | 'NO' | 'ABSTAIN'
  }>
}

export async function getVotingDetails(
  proceedingNumber: number,
  votingNumber: number
): Promise<VotingResult> {
  const response = await fetch(
    `https://api.sejm.gov.pl/sejm/term10/votings/${proceedingNumber}/${votingNumber}`,
    { next: { revalidate: 24 * 3600 } }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch voting data')
  }

  return response.json()
}
