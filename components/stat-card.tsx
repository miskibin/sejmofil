import { CardWrapper } from '@/components/ui/card-wrapper'

interface StatCardProps {
  title: string
  value: number | string
  category: string
  sourceDescription?: string
  sourceUrls?: string[]
  headerIcon?: React.ReactNode
}

export default function StatCard({
  title,
  value,
  headerIcon,
  category,
  sourceDescription,
  sourceUrls,
}: StatCardProps) {
  return (
    <CardWrapper
      title={category}
      subtitle={title}
      showSource={true}
      sourceDescription={sourceDescription}
      sourceUrls={sourceUrls}
      variant="inverted"
      headerIcon={headerIcon}
      showGradient={false}
    >
      <p className="text-3xl font-bold">{value}</p>
    </CardWrapper>
  )
}
