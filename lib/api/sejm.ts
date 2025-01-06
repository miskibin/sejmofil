interface VotingResult {
  abstain: number;
  date: string;
  description: string;
  kind: string;
  no: number;
  notParticipating: number;
  sitting: number;
  sittingDay: number;
  term: number;
  title: string;
  topic: string;
  totalVoted: number;
  votes: Array<{
    MP: number;
    club: string;
    firstName: string;
    lastName: string;
    secondName?: string;
    vote: "YES" | "NO" | "ABSTAIN";
  }>;
}

export async function getVotingDetails(proceedingNumber: number, votingNumber: number): Promise<VotingResult> {
    console.log(proceedingNumber, votingNumber);
  const response = await fetch(
    `https://api.sejm.gov.pl/sejm/term10/votings/${proceedingNumber}/${votingNumber}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch voting data');
  }
  
  return response.json();
}
