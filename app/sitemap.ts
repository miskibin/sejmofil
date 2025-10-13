import { createClient } from '@/utils/supabase/server'
import { MetadataRoute } from 'next'
import { getAllEnvoys } from '@/lib/queries/person'
import { getLatestPrints } from '@/lib/queries/process'

type ProceedingWithDays = {
  number: number
  proceeding_day?: Array<{
    date: string
    proceeding_point_ai?: Array<{ id: number }>
  }>
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sejmofil.pl'
  const supabase = createClient()

  // Parallelize all data fetching for better performance
  const [proceedingsResult, envoys, prints] = await Promise.all([
    (await supabase)
      .from('proceeding')
      .select('number, proceeding_day!inner(date, proceeding_point_ai(id))')
      .order('number', { ascending: false })
      .limit(50), // Limit to recent proceedings only
    getAllEnvoys(),
    getLatestPrints(100), // Reduced from 1000 to 100 recent prints
  ])

  const { data: proceedings, error } = proceedingsResult

  if (error) {
    console.error('Error fetching proceedings for sitemap:', error)
  }

  const processIds = [
    ...new Set(prints.map((p) => p.processPrint?.[0]).filter(Boolean)),
  ]

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proceedings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/envoys`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/processes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Dynamic routes for proceedings
  const proceedingRoutes =
    (proceedings as ProceedingWithDays[])?.flatMap((proceeding) =>
      (proceeding.proceeding_day ?? []).flatMap((day) =>
        (day.proceeding_point_ai ?? []).map((point) => ({
          url: `${baseUrl}/proceedings/${proceeding.number}/${day.date}/${point.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      )
    ) || []

  // Dynamic routes for envoys (from Neo4j)
  const envoyRoutes = envoys.map((envoy) => ({
    url: `${baseUrl}/envoys/${envoy.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Dynamic routes for processes (from Neo4j)
  const processRoutes = processIds.map((id) => ({
    url: `${baseUrl}/processes/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...proceedingRoutes,
    ...envoyRoutes,
    ...processRoutes,
  ]
}
