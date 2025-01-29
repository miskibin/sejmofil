import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sejmofil',
    short_name: 'Sejmofil',
    description:
      'Sejmofil to platforma do analizy danych z Sejmu RP przy pomocy AI',
    start_url: '/',
    display: 'standalone',
    theme_color: '#76052a',
    background_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
