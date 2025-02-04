import ArticlesNav from './articles-nav'
import PostCard from './post-card'
import { LatestPointsResult } from '@/lib/types/proceeding'

interface ArticlesSectionProps {
  posts: LatestPointsResult[]
}

export default function ArticlesSection({ posts }: ArticlesSectionProps) {
  return (
    <div className="space-y-6">
      <ArticlesNav />
      <div className="space-y-4">
        {posts.map((post) => (
          <>
            <PostCard
              key={`point-${post.proceedingNumber}-${post.date}-${post.pointId}`}
              {...post}
              proceedingNumber={post.proceedingNumber.toString()}
            />
            <hr className="border-t border-gray-200" />
          </>
        ))}
      </div>
    </div>
  )
}
