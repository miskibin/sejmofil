import {
  getLatestProceedingPoints,
  getPopularProceedingPoints,
  getAllCategories,
} from '@/lib/supabase/getProceedings'
import ArticlesSection from './articles-section'
import Sidebar from './sidebar'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FeedPage({ searchParams }: PageProps) {
  // Convert searchParams to string safely
  const params = await searchParams
  const sort = typeof params?.sort === 'string' ? params.sort : 'foryou'

  const [posts, allCategories] = await Promise.all([
    (async () => {
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
    })(),
    getAllCategories(),
  ])

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 p-2 sm:p-4 max-w-7xl mx-auto">
      <div className="flex-1 min-w-0">
        <Suspense
          fallback={
            <ArticlesSection
              posts={[]}
              sort={sort}
              allCategories={[]}
              isLoading
            />
          }
        >
          <ArticlesSection
            posts={posts}
            sort={sort}
            allCategories={allCategories}
          />
        </Suspense>
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <Sidebar />
      </div>
    </div>
  )
}
