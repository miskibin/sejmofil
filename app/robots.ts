import { MetadataRoute } from 'next'

// Static content - cache for 1 day
export const revalidate = 86400

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sejmofil.pl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/login/',
        '/test/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
