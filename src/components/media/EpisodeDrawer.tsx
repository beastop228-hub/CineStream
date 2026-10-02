// CineStream — sliding episode/season selector drawer for TV watch pages.
// Slide-out panel per SITE_SPEC <meaningful_interactions>; fetches episodes
// per season via the /api/tv/season server proxy.

"use client";

import { useEffect, useState } from "react";
import { X, Play, Loader2 } from "lucide-react";

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
}

export interface EpisodeSummary {
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
}

interface EpisodeDrawerProps {
  tvId: string;
  seasons: SeasonSummary[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  open: boolean;
  onClose: () => void;
}

export function EpisodeDrawer({
  tvId,
  seasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  open,
  onClose,
}: EpisodeDrawerProps) {
  const [activeSeason, setActiveSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // Load episodes for the active season through the server proxy.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tv/season?id=${tvId}&season=${activeSeason}`);
        if (!res.ok) throw new Error("episodes failed");
        const data: { episodes: EpisodeSummary[] } = await res.json();
        if (!cancelled) setEpisodes(data.episodes);
      } catch {
        if (!cancelled) setEpisodes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = setTimeout(load, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, tvId, activeSeason]);

  // Sync the drawer's season tab with external navigation.
  useEffect(() => {
    const timer = setTimeout(() => setActiveSeason(currentSeason), 0);
    return () => clearTimeout(timer);
  }, [currentSeason]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close episode list"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-black/50 backdrop-blur-sm"
        />
      )}

      <aside
        aria-label="Episodes"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="font-display text-lg font-bold text-text-primary">Episodes</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close episode list"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {/* Season selector */}
        <div className="border-b border-border-subtle px-5 py-3">
          <label htmlFor="season-select" className="sr-only">
            Select season
          </label>
          <select
            id="season-select"
            value={activeSeason}
            onChange={(e) => setActiveSeason(Number(e.target.value))}
            className="w-full rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            {seasons.map((s) => (
              <option key={s.seasonNumber} value={s.seasonNumber}>
                {s.name} • {s.episodeCount} episode{s.episodeCount === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        {/* Episode list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-text-secondary">
              <Loader2 size={20} className="animate-spin text-accent" aria-hidden="true" />
              <span>Loading episodes…</span>
            </div>
          ) : episodes.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-text-secondary">
              No episodes available for this season.
            </p>
          ) : (
            <ul>
              {episodes.map((ep) => {
                const isCurrent =
                  activeSeason === currentSeason && ep.episodeNumber === currentEpisode;
                return (
                  <li key={ep.episodeNumber}>
                    <button
                      type="button"
                      onClick={() => onSelectEpisode(activeSeason, ep.episodeNumber)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        isCurrent ? "bg-accent/15" : "hover:bg-background/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isCurrent ? "bg-accent text-white" : "bg-background/70 text-text-secondary"
                        }`}
                      >
                        {isCurrent ? <Play size={14} aria-hidden="true" /> : ep.episodeNumber}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-text-primary">
                          {ep.episodeNumber}. {ep.name}
                        </span>
                        {ep.runtime ? (
                          <span className="mt-0.5 block text-xs text-text-secondary">
                            {ep.runtime} min
                          </span>
                        ) : null}
                        {ep.overview ? (
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-text-secondary">
                            {ep.overview}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}