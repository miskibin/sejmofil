import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ClubsLoading() {
  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-64 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}
