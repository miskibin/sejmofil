import { CardWrapper } from '@/components/ui/card-wrapper'
import { Code, Paintbrush, ScrollText } from 'lucide-react'

export async function JoinUs() {
  return (
    <CardWrapper
      title="Podoba Ci się nasza praca?"
      subtitle="Dołącz do nas"
      showMoreLink="/about"
      className="col-span-1 lg:col-span-2"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <Paintbrush className="text-prrimary h-4 w-4" />
            <span className="text-sm">UI/UX</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg p-2">
            <Code className="text-prrimary h-4 w-4" />
            <span className="text-sm">Frontend</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg p-2">
            <ScrollText className="text-prrimary h-4 w-4" />
            <span className="text-sm">Legislacja</span>
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}
