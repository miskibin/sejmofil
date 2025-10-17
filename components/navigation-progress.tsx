'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
})

export function NavigationProgress() {
  const pathname = usePathname()

  useEffect(() => {
    // Complete progress on route change
    NProgress.done()
  }, [pathname])

  useEffect(() => {
    // Start progress on link clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        !anchor.download &&
        anchor.href.startsWith(window.location.origin)
      ) {
        const url = new URL(anchor.href)
        const currentUrl = new URL(window.location.href)

        // Only show progress if navigating to different page
        if (
          url.pathname !== currentUrl.pathname ||
          url.search !== currentUrl.search
        ) {
          NProgress.start()
        }
      }
    }

    const handleBeforeUnload = () => {
      NProgress.start()
    }

    document.addEventListener('click', handleAnchorClick)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
