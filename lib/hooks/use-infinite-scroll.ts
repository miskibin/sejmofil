import { useEffect, useState } from 'react'

export function useInfiniteScroll<T>(
  items: T[],
  itemsPerPage: number = 10
): [T[], boolean, () => void] {
  const [page, setPage] = useState(1)
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)

  // Reset page when items change
  useEffect(() => {
    setPage(1)
  }, [items])

  useEffect(() => {
    const start = 0
    const end = Math.min(page * itemsPerPage, items.length)
    const slicedItems = items.slice(start, end)
    setDisplayedItems(slicedItems)
    setHasMore(end < items.length)
  }, [page, items, itemsPerPage])

  const loadMore = () => {
    if (!hasMore) return
    setPage((prevPage) => prevPage + 1)
  }

  return [displayedItems, hasMore, loadMore]
}
