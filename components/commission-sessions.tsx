import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Session {
  title: string
  commission: string
  status: 'in-progress' | 'completed'
}

export default function CommissionSessions() {
  const sessions: Session[] = [
    {
      title: "Wypłacanie odszkodowań ofiarą powodzi",
      commission: "Komisja do Spraw Powodzi",
      status: "in-progress"
    },
    {
      title: "Usuwania pieniędzy",
      commission: "Komisja do Spraw Powodzi",
      status: "in-progress"
    },
    {
      title: "Pegasus to konsola",
      commission: "Komisja do Spraw Podsłuchu",
      status: "completed"
    },
    {
      title: "Tiktok to rolki instagram random",
      commission: "Komisja do Spraw Podsłuchu",
      status: "completed"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <span className="text-sm text-[#8B1538]">Monitor</span>
          <CardTitle>Posiedzenia Komisji</CardTitle>
        </div>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">12 Nov</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex gap-3">
            <div className={`w-1 self-stretch rounded ${
              session.status === 'in-progress' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">{session.title}</p>
              <p className="text-sm text-muted-foreground">{session.commission}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            W trakcie
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Zakonczone
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

