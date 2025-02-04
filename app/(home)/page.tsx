import { getLatestProceedingPoints } from '@/lib/supabase/getProceedings'
import ArticlesSection from "./articles-section"
import Sidebar from "./sidebar"

export default async function FeedPage() {
  const posts = await getLatestProceedingPoints()

  return (
    <div className="flex gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex-1">
        <ArticlesSection posts={posts} />
      </div>
      <Sidebar />
    </div>
  )
}

