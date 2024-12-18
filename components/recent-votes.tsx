import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Vote {
  title: string
  amendment: string
  status: 'positive' | 'negative'
}

export default function RecentVotes() {
  const votes: Vote[] = [
    {
      title: "Ustawa o zadość uczynieniu poszkodowanym w wyniku wypadku samochodowego",
      amendment: "Poprawka 4",
      status: "positive"
    },
    {
      title: "Ustawa o dostępnej pigułce na ból głowy na życzenie",
      amendment: "Poprawka 4",
      status: "negative"
    },
    {
      title: "Ustawa o ochronie praw zwierząt w schroniskach",
      amendment: "Poprawka 7",
      status: "positive"
    },
    {
      title: "Ustawa o zwiększeniu dostępności opieki zdrowotnej",
      amendment: "Poprawka 7",
      status: "negative"
    },
    {
      title: "Ustawa o wsparciu edukacji publicznej",
      amendment: "Poprawka 7",
      status: "positive"
    },
    {
      title: "Ustawa o ochronie praw konsumentów",
      amendment: "Poprawka 2",
      status: "positive"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <span className="text-sm text-[#8B1538]">🔥 Newsy</span>
          <CardTitle>Ostatnie Głosowania</CardTitle>
        </div>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">20 Nov</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {votes.map((vote, index) => (
          <div key={index} className="flex gap-3">
            <div className={`w-1 self-stretch rounded ${
              vote.status === 'positive' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">{vote.title}</p>
              <p className="text-sm text-muted-foreground">{vote.amendment}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

