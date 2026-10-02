// CineStream — instant search client: debounced queries to /api/search,
// rendered as a responsive poster grid. Input is sanitized server-side (Zod).

"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { MediaTitle } from "@/lib/types";
import { MediaCard } from "./MediaCard";
import { MediaGridSkeleton } from "./MediaGridSkeleton";

interface SearchClientProps {
  initialQuery: string;
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced instant search: fires 350ms after the last keystroke.
  // All state updates happen inside the timer callback (never synchronously
  // in the effect body) to avoid cascading renders.
  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (!q) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data: { results: MediaTitle[] } = await res.json();
        setResults(data.results);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <section aria-label="Search results" className="mt-6">
      <label htmlFor="search-input" className="sr-only">
        Search movies and series
      </label>
      <div className="relative max-w-xl">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, e.g. Inception…"
          autoComplete="off"
          maxLength={100}
          className="w-full rounded-full border border-border-subtle bg-surface/80 py-3 pl-11 pr-4 text-base text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
      </div>

      <p className="mt-4 text-sm text-text-secondary" aria-live="polite">
        {loading
          ? "Searching…"
          : query.trim()
            ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query.trim()}”`
            : "Start typing to search movies and series."}
      </p>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      {/* Pulse skeletons while TMDB results are fetching (shadcn skeleton pattern) */}
      {loading && <MediaGridSkeleton count={6} />}

      {!loading && results.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((title) => (
            <li key={`${title.mediaType}-${title.id}`} className="list-none">
              <MediaCard title={title} />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && query.trim() && results.length === 0 && (
        <p className="mt-12 text-center text-text-secondary">
          No results found. Try a different keyword.
        </p>
      )}
    </section>
  );
}