// CineStream — "Continue Watching" row sourced from local viewing history.
// Reads the persisted Zustand history store; renders nothing until hydrated
// and populated, so it never causes a hydration mismatch.

"use client";

import { useSyncExternalStore } from "react";
import type { MediaTitle } from "@/lib/types";
import { useHistoryStore, type HistoryEntry } from "@/store/history";
import { MediaCard } from "./MediaCard";

function toMediaTitle(entry: HistoryEntry): MediaTitle {
  return {
    id: entry.id,
    mediaType: entry.mediaType,
    title: entry.title,
    overview: "",
    posterUrl: entry.posterUrl,
    backdropUrl: "",
    releaseDate: "",
    voteAverage: 0,
    genres: [],
    qualityTags: [],
  };
}

function entryHref(entry: HistoryEntry): string {
  if (entry.mediaType === "tv") {
    const s = entry.season ?? 1;
    const e = entry.episode ?? 1;
    return `/watch/${entry.id}?type=tv&season=${s}&episode=${e}`;
  }
  return `/watch/${entry.id}?type=movie`;
}

export function ContinueWatchingRow() {
  const entries = useHistoryStore((s) => s.entries);

  // Hydration-safe: empty on server/first render, real history after hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted || entries.length === 0) return null;

  return (
    <section aria-labelledby="continue-watching-heading" className="group/row relative py-4">
      <div className="mb-3 px-4 sm:px-8 lg:px-12">
        <h2
          id="continue-watching-heading"
          className="font-display text-lg font-bold text-text-primary sm:text-xl"
        >
          Continue Watching
        </h2>
      </div>
      <ul className="flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {entries.map((entry) => (
          <li
            key={`${entry.mediaType}-${entry.id}`}
            className="list-none w-[150px] shrink-0 sm:w-[170px] lg:w-[185px]"
          >
            <MediaCard title={toMediaTitle(entry)} href={entryHref(entry)} />
          </li>
        ))}
      </ul>
    </section>
  );
}