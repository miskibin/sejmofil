'use client'

import { LoginDialog } from '@/components/login-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Menu, Newspaper, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

const navLinks = [
  { href: '/envoys', text: 'Posłowie' },
  { href: '/processes', text: 'Procesy Sejmowe' },
  { href: '/proceedings', text: 'Posiedzenia' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  const SearchInput = ({ className = '', ...props }) => {
    const [searchValue, setSearchValue] = useState('')
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchValue.trim()) {
        window.location.href = `/search?q=${encodeURIComponent(
          searchValue.trim()
        )}`
      }
    }

    return (
      <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full rounded-full border-0 bg-gray-100 py-2 pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary"
          placeholder="Szukaj..."
          {...props}
        />
      </form>
    )
  }

  const handleLinkClick = () => {
    setIsSidebarOpen(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 shadow-md backdrop-blur' : 'bg-transparent'
      } grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3`}
    >
      {/* Left section with logo and links */}
      <div className="flex items-center gap-6">
        {/* Mobile Menu */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg"
                  onClick={handleLinkClick}
                >
                  {link.text}
                </Link>
              ))}
              <Link href="/about" className="text-lg" onClick={handleLinkClick}>
                O Projekcie
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Sejmofil"
            width={40}
            height={40}
            className="h-8 w-8 md:h-10 md:w-10"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} prefetch={true}>
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Center section with search */}
      <div className="mx-auto w-full max-w-lg">
        <SearchInput />
      </div>

      {/* Right section with actions */}
      <div className="flex items-center justify-end gap-2 md:gap-4">
        <Newspaper className="hidden h-6 w-6 text-gray-500 md:block" />
        <Link href="/about" prefetch={true}>
          <Button className="hidden bg-primary transition-colors hover:bg-[#7A1230] md:block">
            O Projekcie
          </Button>
        </Link>
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleSignOut}
          >
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.user_name || 'User'}
              />
              <AvatarFallback>
                {(user.user_metadata.user_name || 'User')[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <LoginDialog />
        )}
      </div>
    </nav>
  )
}
