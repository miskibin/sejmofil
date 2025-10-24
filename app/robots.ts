import { MetadataRoute } from 'next'

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
