// CineStream — infinite discover catalog for /browse.
// Type toggle + sort + genre filters with "Load More" pagination, fetched via
// the server-side /api/discover proxy (API key never reaches the browser).

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { MediaTitle } from "@/lib/types";
import type { GenreOption } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { MediaGridSkeleton } from "./MediaGridSkeleton";

type MediaType = "movie" | "tv";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Recently Released" },
];

interface BrowseCatalogProps {
  genres: GenreOption[];
}

interface DiscoverResponse {
  titles: MediaTitle[];
  page: number;
  totalPages: number;
}

export function BrowseCatalog({ genres }: BrowseCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialType = (searchParams.get("type") as MediaType) || "movie";
  const urlGenre = searchParams.get("genre");
  let initialGenreId = "";
  if (urlGenre) {
    const found = genres.find((g) => g.name.toLowerCase() === urlGenre.toLowerCase());
    if (found) initialGenreId = String(found.id);
  }

  const [mediaType, setMediaType] = useState<MediaType>(initialType);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [genre, setGenre] = useState(initialGenreId);
  
  const [items, setItems] = useState<MediaTitle[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards against overlapping requests (rapid scroll / filter changes) and
  // stale responses overwriting newer ones.
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);

  // Stable across renders: only uses its arguments and state setters.
  const fetchPage = useCallback(async (
    nextPageType: MediaType,
    nextSort: string,
    nextGenre: string,
    nextPage: number,
    reset: boolean
  ) => {
    if (inFlightRef.current) return; // one request at a time
    inFlightRef.current = true;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type: nextPageType,
        sort: nextSort,
        page: String(nextPage),
      });
      if (nextGenre) params.set("genre", nextGenre);
      const res = await fetch(`/api/discover?${params.toString()}`);
      if (!res.ok) throw new Error("Discover failed");
      const data: DiscoverResponse = await res.json();
      if (requestId !== requestIdRef.current) return; // superseded
      setItems((prev) => {
        if (reset) {
          // Dedupe even on reset: TMDB pages can contain the same title twice
          // (e.g. multi-genre entries), which would produce duplicate keys.
          const seen = new Set<string>();
          return data.titles.filter((t) => {
            const key = `${t.mediaType}-${t.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
        // Dedupe by mediaType+id: TMDB discover pages can overlap, and this
        // prevents duplicate React keys.
        const seen = new Set(prev.map((t) => `${t.mediaType}-${t.id}`));
        const merged = [...prev];
        for (const t of data.titles) {
          const key = `${t.mediaType}-${t.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(t);
          }
        }
        return merged;
      });
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      if (requestId === requestIdRef.current) {
        setError("Failed to load the catalog. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  // True infinite scroll: auto-load the next page when the sentinel scrolls
  // into view (600px pre-fetch margin). The Load More button remains as the
  // keyboard-accessible fallback.
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || page >= totalPages) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void fetchPage(mediaType, sortBy, genre, page + 1, false);
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchPage, loading, page, totalPages, mediaType, sortBy, genre]);

  // Initial load on mount or when URL query changes.
  useEffect(() => {
    const urlType = (searchParams.get("type") as MediaType) || "movie";
    const urlGenre = searchParams.get("genre");
    let genreId = "";
    if (urlGenre) {
      const found = genres.find((g) => g.name.toLowerCase() === urlGenre.toLowerCase());
      if (found) genreId = String(found.id);
    }
    
    const timer = setTimeout(
      () => {
        setMediaType(urlType);
        setGenre(genreId);
        void fetchPage(urlType, sortBy, genreId, 1, true);
      },
      0
    );
    return () => clearTimeout(timer);
    // We intentionally only depend on URL changes here so back/forward works, 
    // but not sortBy/genre since those are managed by local state below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchPage, genres]);

  return (
    <section aria-label="Catalog results" className="mt-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface/60 p-3 backdrop-blur-sm">
        <div role="group" aria-label="Content type" className="flex gap-1 rounded-full bg-background/60 p-1">
          {(["movie", "tv"] as const).map((t) => (
            <button
              key={t}
              type="button"
              tabIndex={0}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("type", t);
                // We keep the genre param in the URL when switching types
                router.push(`/browse?${params.toString()}`);
              }}
              aria-pressed={mediaType === t}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors tv-focus ${
                mediaType === t ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>

        <label htmlFor="sort-filter" className="sr-only">
          Sort catalog
        </label>
        <select
          id="sort-filter"
          value={sortBy}
          tabIndex={0}
          onChange={(e) => {
            setSortBy(e.target.value);
            void fetchPage(mediaType, e.target.value, genre, 1, true);
          }}
          className="rounded-full border border-border-subtle bg-background/60 px-4 py-2 text-sm text-text-primary tv-focus focus:border-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor="genre-filter" className="sr-only">
          Filter by genre
        </label>
        <select
          id="genre-filter"
          value={genre}
          tabIndex={0}
          onChange={(e) => {
            const newGenreId = e.target.value;
            setGenre(newGenreId);
            
            const params = new URLSearchParams(searchParams.toString());
            const found = genres.find(g => String(g.id) === newGenreId);
            if (found) {
              params.set("genre", found.name.toLowerCase());
            } else {
              params.delete("genre");
            }
            router.push(`/browse?${params.toString()}`);
          }}
          className="rounded-full border border-border-subtle bg-background/60 px-4 py-2 text-sm text-text-primary tv-focus focus:border-accent"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <p className="ml-auto text-sm text-text-secondary" aria-live="polite">
          {items.length} title{items.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      {/* Grid */}
      {loading && items.length === 0 ? (
        <MediaGridSkeleton count={12} />
      ) : items.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((title) => (
            <li key={`${title.mediaType}-${title.id}`} className="list-none">
              <MediaCard title={title} fluid />
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <p className="mt-12 text-center text-text-secondary">
            No titles found. Try different filters.
          </p>
        )
      )}

      {/* Infinite-scroll sentinel (auto-loads next page near the bottom) */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      {/* Load more (accessible fallback for the auto-loader above) */}
      <div className="flex justify-center pt-8">
        {loading && items.length > 0 ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            <span>Fetching more titles from catalog…</span>
          </div>
        ) : page < totalPages ? (
          <button
            type="button"
            tabIndex={0}
            onClick={() => void fetchPage(mediaType, sortBy, genre, page + 1, false)}
            className="rounded-lg border border-border-subtle bg-surface px-8 py-3 font-semibold text-text-primary transition-colors hover:border-text-secondary tv-focus"
          >
            Load More Titles
          </button>
        ) : (
          items.length > 0 && (
            <p className="text-sm text-text-secondary">You have reached the end of the catalog.</p>
          )
        )}
      </div>
    </section>
  );
}