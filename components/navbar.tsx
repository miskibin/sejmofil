"use client";

import { Menu, Newspaper, Search } from "lucide-react";
import { useEffect, useState } from "react";
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

const searchTexts = [
  "Donald Tusk",
  "Powódź na dolnym śląsku",
  "Budżet państwa 2024",
  "Immunitet poselski",
];

export default function Navbar() {
  const [currentText, setCurrentText] = useState(searchTexts[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  useEffect(() => {
    let currentIndex = 0;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Wait for fade out
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % searchTexts.length;
        setCurrentText(searchTexts[currentIndex]);
        setIsTransitioning(false);
      }, 400); // Half of the transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  return (
    <nav className="px-4 py-3 flex items-center justify-between border-b-[1px] border-gray-200">
      <div className="flex items-center gap-2">
        {/* Mobile Menu */}
        <Sheet>
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
              <Link href="/poslowie" className="text-lg">
                Posłowie
              </Link>
              <Link href="/process" className="text-lg">
                Procesy Sejmowe
              </Link>
              <Link href="/posiedzenia" className="text-lg">
                Posiedzenia
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
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        <Link href="/poslowie">Posłowie</Link>
        <Link href="/process">Procesy Sejmowe</Link>
        <Link href="/posiedzenia">Posiedzenia</Link>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden md:flex flex-1 max-w-xl mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-primary bg-gray-100"
          />
          {searchValue === "" && (
            <div
              className="absolute inset-0 pointer-events-none pl-10 flex items-center text-gray-500 transition-opacity duration-800"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {currentText}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="w-full">
          <div className="relative w-full pt-4">
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-primary bg-gray-100"
              placeholder="Szukaj..."
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Newspaper className="hidden md:block h-6 w-6 text-gray-500" />
        <Button className="hidden md:block bg-primary hover:bg-[#7A1230] transition-colors">
          O Projekcie
        </Button>
        <Avatar className="w-8 h-8 md:w-10 md:h-10">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
