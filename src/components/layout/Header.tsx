// CineStream — sticky glassmorphic header with persistent search

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, X, Filter, Star } from "lucide-react";
import { searchMulti } from "@/lib/tmdb";
import { useModalStore } from "@/store/modal";
import type { MediaTitle } from "@/lib/types";

const NAV_LINKS = [
  { href: "/browse?type=movie", label: "Movies" },
  { href: "/browse?type=tv", label: "Web Series" },
];

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror"
];

export function Header() {
  const router = useRouter();
  const openModal = useModalStore((s) => s.openModal);
  
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  
  const [searchResults, setSearchResults] = useState<MediaTitle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const actionGroupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener for dropdown and search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionGroupRef.current && !actionGroupRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
        setIsSearchExpanded(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMulti(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border-subtle bg-black/70 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/90 to-transparent"
      }`}
    >
      <nav aria-label="Primary" className="flex items-center gap-4 px-4 py-3 sm:gap-6 sm:px-8 lg:px-12 2xl:px-[5vw] 2xl:py-6">
        <Link
          href="/"
          tabIndex={0}
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-text-primary tv-focus rounded-md px-2 py-1"
        >
          <span>CineStream</span>
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                tabIndex={0}
                className="text-sm font-semibold tracking-tight text-text-secondary transition-colors hover:text-text-primary tv-focus rounded-md px-3 py-1.5"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div ref={actionGroupRef} className="ml-auto flex items-center gap-3">
          {/* Expanding Search */}
          <form 
            role="search" 
            onSubmit={submitSearch} 
            className={`relative flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-64 sm:w-72' : 'w-10'} h-10`}
          >
            <div className={`absolute right-0 flex items-center overflow-hidden rounded-full bg-[#1C1C1E] transition-all duration-300 ${isSearchExpanded ? 'w-full h-full border border-border-subtle bg-black' : 'w-10 h-10 cursor-pointer border border-transparent'}`}>
              
              <button 
                type="button"
                aria-label="Toggle search"
                tabIndex={0}
                onClick={() => {
                  if (!isSearchExpanded) {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }}
                className={`absolute left-0 flex h-10 w-10 items-center justify-center text-text-secondary tv-focus rounded-full ${isSearchExpanded ? 'pointer-events-none' : ''}`}
              >
                <Search size={18} />
              </button>

              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className={`h-full w-full bg-transparent pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-opacity duration-300 tv-focus ${isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                tabIndex={isSearchExpanded ? 0 : -1}
              />

              {isSearchExpanded && (
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => {
                    setQuery("");
                    setIsSearchExpanded(false);
                  }}
                  className="absolute right-0 flex h-10 w-10 items-center justify-center text-text-secondary hover:text-white transition-colors tv-focus rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchExpanded && query.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-3 w-72 sm:w-80 max-h-96 overflow-y-auto rounded-xl border border-border-subtle bg-[#1C1C1E] shadow-2xl z-[60] overscroll-contain">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-text-secondary">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-text-secondary">No results found</div>
                ) : (
                  <ul className="py-2">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <button
                          type="button"
                          tabIndex={0}
                          onClick={() => {
                            setQuery("");
                            setIsSearchExpanded(false);
                            openModal(result.id, result.mediaType);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.keyCode === 13) {
                              e.preventDefault();
                              setQuery("");
                              setIsSearchExpanded(false);
                              openModal(result.id, result.mediaType);
                            }
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors tv-focus"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-black/50">
                            <Image
                              src={result.posterUrl || "/poster-fallback.svg"}
                              alt={result.title}
                              width={48}
                              height={48}
                              unoptimized={true}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-semibold text-white">{result.title}</span>
                            <span className="truncate text-xs text-text-secondary flex items-center gap-1">
                              {result.mediaType === "tv" ? "TV" : "Movie"} • {result.releaseDate ? result.releaseDate.slice(0, 4) : ""} 
                              {result.voteAverage > 0 && (
                                <>
                                  • <Star size={10} className="fill-accent text-accent inline-block" /> {result.voteAverage.toFixed(1)}
                                </>
                              )}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </form>

          {/* Genre Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              tabIndex={0}
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1C1E] transition-all tv-focus ${isGenreOpen ? 'ring-2 ring-white scale-105' : ''}`}
            >
              <Filter size={18} className="text-text-secondary" />
            </button>

            {isGenreOpen && (
              <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-border-subtle bg-[#1C1C1E] shadow-2xl z-[60] overscroll-contain">
                <div className="border-b border-white/10 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Browse by genre
                  </span>
                </div>
                <ul className="max-h-64 overflow-y-auto py-2">
                  {GENRES.map((genre) => (
                    <li key={genre}>
                      <Link
                        href={`/browse?genre=${genre.toLowerCase()}`}
                        tabIndex={0}
                        onClick={() => setIsGenreOpen(false)}
                        className="block px-4 py-2 text-sm text-text-primary transition-colors tv-focus"
                      >
                        {genre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}