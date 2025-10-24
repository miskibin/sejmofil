'use client'

import { usePathname } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumb-nav'
import { Footer } from '@/components/footer'
import Navbar from '@/components/navbar'

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()

  // Routes that should not have breadcrumbs or footer (but keep navbar)
  const minimalLayoutRoutes = ['/chat']
  const shouldShowMinimalLayout = minimalLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  )

  return (
    <>
      <Navbar />

      {shouldShowMinimalLayout ? (
        <main>
          {children}
        </main>
      ) : (
        <main className="container mx-auto mt-8 sm:mt-4 max-w-7xl p-1 sm:p-6 lg:p-12 2xl:max-w-[1400px]">
          <Breadcrumbs />
          <div className="mt-8 min-h-screen">{children}</div>
        </main>
      )}

      {!shouldShowMinimalLayout && (
        <>
          <hr className="mx-4 my-8" />
          <Footer />
        </>
      )}
    </>
  )
}
