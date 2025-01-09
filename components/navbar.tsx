"use client";

import { Menu, Newspaper, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const navLinks = [
  { href: "/envoys", text: "Posłowie" },
  { href: "/process", text: "Procesy Sejmowe" },
  { href: "/proceedings", text: "Posiedzenia" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const SearchInput = ({ className = "", ...props }) => {
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className={`relative w-full ${className}`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-primary bg-gray-100"
          placeholder="Szukaj..."
          {...props}
        />
      </div>
    );
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 shadow-md backdrop-blur" : "bg-transparent"
      } px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4`}
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
            <div className="flex flex-col gap-4 mt-4">
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
            className="w-8 h-8 md:w-10 md:h-10"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} prefetch={true}>
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Center section with search */}
      <div className="w-full max-w-lg mx-auto">
        <SearchInput />
      </div>

      {/* Right section with actions */}
      <div className="flex items-center justify-end gap-2 md:gap-4">
        <Newspaper className="hidden md:block h-6 w-6 text-gray-500" />
        <Link href="/about" prefetch={true}>
          <Button className="hidden md:block bg-primary hover:bg-[#7A1230] transition-colors">
            O Projekcie
          </Button>
        </Link>
        <Avatar className="w-8 h-8 md:w-10 md:h-10">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
