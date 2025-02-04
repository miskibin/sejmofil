import { CardWrapper } from '@/components/ui/card-wrapper'
import { Sparkles } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  date: string
  category: string
}

export default function HotTopics() {
  const news: NewsItem[] = [
    {
      id: '01',
      title: 'Prokuratoria Generalna RP podsumowuje rok 2022: jakie są wyniki?',
      date: '04 Dec 2024',
      category: 'Obrady',
    },
    {
      id: '02',
      title:
        'Sprawozdanie o stanie mienia Skarbu Państwa: co wiemy o finansach publicznych?',
      date: '04 Dec 2024',
      category: 'Obrady',
    },
    {
      id: '03',
      title: 'Burzliwa debata wokół aborcji: nowe projekty ustaw w Sejmie',
      date: '04 Dec 2024',
      category: 'Obrady',
    },
    {
      id: '04',
      title: 'Burzliwa debata wokół aborcji: nowe projekty ustaw ',
      date: '04 Dec 2024',
      category: 'Obrady',
    },
  ]

  return (
    <CardWrapper
      title="Newsy"
      showGradient={true}
      className="h-full"
      sourceDescription="Dane z oficjalnego api sejmu RP przetworzone przez AI"
      sourceUrls={[
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/prints`,
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/processes`,
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/votings`,
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`,
      ]}
      aiPrompt="Basing on the print topics and summaries create catchy header in polish for the news portal
      in format
      {{ interesting news header 1: [printNumber1, printNumber2 ...]
      interesting news header 2: [...]
      ...
      }}"
      subtitle="Gorące tematy"
      headerIcon={<Sparkles className="h-5 w-5 text-primary" fill="#76052a" />}
    >
      <div className="space-y-4 blur-sm">
        {news.slice(0, 4).map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-lg bg-primary text-center font-semibold text-white">
                {item.id}
              </span>
              <h3 className="font-medium">{item.title}</h3>
            </div>
            <div className="pl-8 text-sm text-muted-foreground">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  )
}
