import { useEffect, useState } from 'react'

export function useInfiniteScroll<T>(
  items: T[],
  itemsPerPage: number = 10
): [T[], boolean, () => void] {
  const [page, setPage] = useState(1)
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const start = 0
    const end = page * itemsPerPage
    const slicedItems = items.slice(start, end)
    setDisplayedItems(slicedItems)
    setHasMore(end < items.length)
  }, [page, items, itemsPerPage])

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  return [displayedItems, hasMore, loadMore]
}
