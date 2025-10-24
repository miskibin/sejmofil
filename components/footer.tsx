'use client'

import { SOCIAL_LINKS, SUPPORT_LINKS } from '@/lib/config/links'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  FaArrowRight,
  FaDiscord,
  FaEnvelope,
  FaGithub,
  FaHandHoldingHeart,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa'

const socialLinks = [
  {
    name: 'email',
    url: `mailto:${SOCIAL_LINKS.CONTACT_EMAIL}`,
    icon: <FaEnvelope className="h-5 w-5 text-gray-800" />,
  },
  {
    name: 'discord',
    url: SOCIAL_LINKS.DISCORD,
    icon: <FaDiscord className="h-5 w-5 text-blue-700" />,
  },
  {
    name: 'youtube',
    url: SOCIAL_LINKS.YOUTUBE,
    icon: <FaYoutube className="h-5 w-5 text-red-600" />,
  },
  {
    name: 'tiktok',
    url: SOCIAL_LINKS.TIKTOK,
    icon: <FaTiktok className="h-5 w-5 text-gray-800" />,
  },
  {
    name: 'github',
    url: SOCIAL_LINKS.GITHUB,
    icon: <FaGithub className="h-5 w-5 text-gray-800" />,
  },
]

const navLinks = [
  { name: 'Polityka Prywatności', url: '/privacy' },
  { name: 'Regulamin', url: '/terms-of-service' },
]

const aboutLinks = [
  { name: 'O projekcie', url: '/about' },
  { name: 'Kontakt', url: '/contact' },
]

export function Footer() {
  const [version, setVersion] = useState<string>('main')
  const [url, setUrl] = useState<string>('#')

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version')
        const data = await response.json()
        setVersion(data.version || 'main')
        setUrl(data.url || '#')
      } catch (error) {
        console.error('Failed to fetch version:', error)
      }
    }
    fetchVersion()
  }, [])

  return (
    <footer className="bg-gray-50 px-4 py-8 sm:py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo and About Section */}
          <div className="col-span-2 space-y-4 sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="text-2xl font-bold text-primary sm:text-3xl">
                Sejmofil
              </div>
            </Link>
            <p className="max-w-xs text-sm text-gray-600 sm:text-base">
              Oddolna inicjaitywa na rzecz przejrzystości i dostępności danych
              sejmowych.
            </p>
            <Link
              href={SUPPORT_LINKS.PATRONITE}
              className="inline-flex items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80 sm:text-base"
            >
              <FaHandHoldingHeart className="h-5 w-5" />
              <span>Wspomóż nas na Patronite</span>
              <FaArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden space-y-4 md:block">
            <h3 className="font-semibold text-primary">O nas</h3>
            <ul className="space-y-2">
              {aboutLinks.map(({ name, url }) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Dokumenty</h3>
            <ul className="space-y-2">
              {navLinks.map(({ name, url }) => (
                <li key={url}>
                  <Link
                    href={url}
                    className="text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Śledź nas</h3>
            <ul className="space-y-2">
              {socialLinks.map(({ name, url, icon }) => (
                <li key={url}>
                  <Link
                    href={url}
                    target="_blank"
                    className="flex items-center gap-2 text-gray-600 transition-colors hover:text-primary"
                    title={name}
                  >
                    {icon}
                    <span className="text-sm">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-gray-200 pt-4 sm:mt-16 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-600 sm:flex-row">
            <div className="flex items-center gap-4">
              <p>© Wszelkie prawa zastrzeżone {new Date().getFullYear()}</p>
              <span className="hidden sm:inline">•</span>
              <Link
                href={url}
                target="_blank"
                className="rounded bg-gray-100 px-2 py-1 font-mono text-xs transition-colors hover:bg-gray-200"
              >
                {version}
              </Link>
            </div>
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Polityka Prywatności
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
