"use client";

import { Calendar, Newspaper, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const searchTexts = [
  "Szukaj informacji o posłach",
  "Szukaj procesów sejmowych",
  "Szukaj posiedzeń",
  "Wyszukaj dokumenty",
];

export default function Navbar() {
  const [currentText, setCurrentText] = useState(searchTexts[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image src="/logo.png" alt="Sejmofil" width={40} height={40} />
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 ml-8">
        <Link href="/poslowie" className="transition-colors">
          Posłowie
        </Link>
        <Link href="/procesy" className="transition-colors">
          Procesy Sejmowe
        </Link>
        <Link href="/posiedzenia" className="transition-colors">
          Posiedzenia
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-[#8B1538]"
          />
          {searchValue === "" && (
            <div
              className="absolute inset-0 pointer-events-none pl-10 flex items-center text-gray-400 transition-opacity duration-800"
              style={{
                opacity: isTransitioning ? 0 : 1,
              }}
            >
              {currentText}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost">
          <Newspaper className="h-7 w-7" />
        </Button>
        <Button className="bg-[#8B1538] hover:bg-[#7A1230] transition-colors">
          O Projekcie
        </Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
