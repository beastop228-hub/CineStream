// CineStream — media poster card with hover reveal and watchlist toggle

"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { MediaTitle } from "@/lib/types";
import { useWatchlistStore } from "@/store/watchlist";
import { useModalStore } from "@/store/modal";

interface MediaCardProps {
  title: MediaTitle;
  /** Stretch to the parent slide width (used inside Embla carousels). */
  fluid?: boolean;
  /** Optional link override (e.g. Continue Watching deep-links to an episode). */
  href?: string;
  variant?: "standard" | "top-10" | "genre";
  index?: number;
}

function releaseYear(date: string): string {
  return date ? date.slice(0, 4) : "";
}

export function MediaCard({ title, fluid = false, href, variant = "standard", index = 0 }: MediaCardProps) {
  const has = useWatchlistStore((s) => s.has);
  const toggle = useWatchlistStore((s) => s.toggle);
  const openModal = useModalStore((s) => s.openModal);

  // Hydration-safe flag: false on server/first render, true on client after hydration.
  // (useSyncExternalStore avoids setState-in-effect cascades.)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const inList = mounted && has(title.mediaType, title.id);
  const watchHref = href ?? `/watch/${title.id}?type=${title.mediaType}`;

  return (
    <article
      className={`group relative ${
        fluid ? "w-full" : "w-[150px] shrink-0 sm:w-[170px] lg:w-[185px]"
      }`}
      aria-label={`${title.title} (${releaseYear(title.releaseDate)})`}
    >
      {variant === "top-10" && (
        <span className="absolute -left-2 -top-4 z-20 font-display text-[80px] font-bold leading-none text-white tracking-tighter drop-shadow-xl select-none mix-blend-overlay">
          {index + 1}
        </span>
      )}
      <Link
        href={watchHref}
        tabIndex={0}
        onClick={(e) => {
          if (!href) {
            e.preventDefault();
            openModal(title.id, title.mediaType as "movie" | "tv");
          }
        }}
        className={`block overflow-hidden border border-border-subtle bg-surface tv-focus group-hover:shadow-2xl transition-shadow ${
          variant === "genre" ? "rounded-3xl" : "rounded-xl"
        }`}
      >
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={title.posterUrl || "/poster-fallback.svg"}
            alt={`Poster for ${title.title}`}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
            className="object-cover"
          />
          {variant === "genre" && (
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
              <span className="text-center font-bold text-white drop-shadow-md">{title.title}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Watchlist toggle */}
      <button
        type="button"
        tabIndex={0}
        onClick={() => toggle(title.mediaType, title.id)}
        aria-label={inList ? `Remove ${title.title} from watchlist` : `Add ${title.title} to watchlist`}
        aria-pressed={inList}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-text-primary opacity-0 backdrop-blur-sm transition-all duration-200 tv-focus group-hover:opacity-100 focus-visible:opacity-100"
      >
        {inList ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      </button>

      {variant !== "genre" && (
        <div className="px-1 pt-3">
          <h3 className="truncate text-sm font-semibold tracking-tight text-text-primary">{title.title}</h3>
          <p className="mt-0.5 text-xs font-medium text-text-secondary">
            {title.genres[0]} • {title.mediaType === "tv" ? "Series" : "Film"}
          </p>
        </div>
      )}
    </article>
  );
}