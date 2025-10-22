import {
  getLatestProceedingPoints,
  getPopularProceedingPoints,
  getAllCategories,
  getMaxProceedingNumber,
} from '@/lib/supabase/getProceedings'
import ArticlesSection from './articles-section'
import Sidebar from './sidebar'

// Enable ISR with revalidation every 5 minutes
export const revalidate = 300
// export const experimental_ppr = true // Requires Next.js canary

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getPosts(sort: string) {
  switch (sort) {
    case 'popular':
      return getPopularProceedingPoints()
    case 'latest':
      return getLatestProceedingPoints()
    default:
      if (sort.startsWith('category-')) {
        const category = decodeURIComponent(sort.replace('category-', ''))
        return getLatestProceedingPoints(category)
      }
      return getLatestProceedingPoints()
  }
}

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sort = typeof params?.sort === 'string' ? params.sort : 'foryou'

  const [posts, allCategories, maxProceedingNumber] = await Promise.all([
    getPosts(sort),
    getAllCategories(),
    getMaxProceedingNumber(),
  ])

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 p-2 sm:p-4 max-w-7xl mx-auto">
      <div className="flex-1 min-w-0">
        <ArticlesSection
          posts={posts}
          sort={sort}
          allCategories={allCategories}
          maxProceedingNumber={maxProceedingNumber}
        />
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <Sidebar />
      </div>
    </div>
  )
}
