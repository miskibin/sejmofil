// components/Breadcrumbs.tsx
'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const urlToPolishName: { [key: string]: string } = {
  envoys: 'Posłowie',
  clubs: 'Kluby parlamentarne',
  votings: 'Głosowania',
  stats: 'Statystyki',
  processes: 'Procesy legislacyjne',
  committees: 'Komisje sejmowe',
  interpellations: 'Interpelacje',
  acts: 'Dziennik ustaw',
  about: 'O projekcie',
  privacy: 'Polityka prywatności',
  'terms-of-service': 'regulamin',
  search: 'Wyszukiwarka',
  points: 'Punkty porządku dziennego',
  profile: 'Profil',
  proceedings: 'Posiedzenia',

  // Add more mappings as needed
}

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()

  // Don't render breadcrumbs on the home page
  if (pathname === '/') {
    return null
  }

  const pathSegments = pathname?.split('/').filter((segment) => segment !== '')

  return (
    <nav className="mt-7 flex py-3 sm:mt-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="hover:text-primary-600 inline-flex items-center text-sm font-medium"
          >
            <Home className="mx-1 inline h-4 w-4" />
          </Link>
        </li>
        {pathSegments?.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`
          const isLast = index === pathSegments.length - 1
          const polishName =
            urlToPolishName[segment.replace('-results', '')] || segment

          return (
            <li key={href}>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 font-bold" />
                {isLast ? (
                  <span className="ml-1 text-sm font-medium md:ml-2">
                    {polishName}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="ml-1 text-sm font-medium hover:text-primary md:ml-2"
                  >
                    {polishName}
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
