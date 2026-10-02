// CineStream — full-screen cloud-stream player with multi-server fallback,
// TV episode drawer, and local Continue Watching history.
// Server switcher: vidsrc.to, vidsrc.xyz, 2embed.cc, autoembed.co.
// URL patterns follow each provider's documented embed format (generated defaults —
// verify against the provider if a source stops loading).

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Server, ListVideo } from "lucide-react";
import { useHistoryStore } from "@/store/history";
import { EpisodeDrawer, type SeasonSummary } from "./EpisodeDrawer";

interface StreamServer {
  id: number;
  name: string;
  movieUrl: (id: string, imdbId?: string) => string;
  tvUrl: (id: string, season: string, episode: string, imdbId?: string) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: 1,
    name: "Server 1",
    movieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 2,
    name: "Server 2",
    movieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 3,
    name: "Server 3",
    movieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 4,
    name: "Server 4",
    movieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  }
];

interface StreamPlayerProps {
  mediaType: "movie" | "tv";
  id: string;
  imdbId?: string;
  season: string;
  episode: string;
  titleName: string;
  posterUrl: string;
  seasons?: SeasonSummary[];
}

export function StreamPlayer({
  mediaType,
  id,
  imdbId,
  season,
  episode,
  titleName,
  posterUrl,
  seasons = [],
}: StreamPlayerProps) {
  const router = useRouter();
  const [serverId, setServerId] = useState(STREAM_SERVERS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);
  const record = useHistoryStore((s) => s.record);

  const server = STREAM_SERVERS.find((s) => s.id === serverId) ?? STREAM_SERVERS[0];
  const isTv = mediaType === "tv";

  // Cloud streaming embed URL mapped by TMDB ID (or IMDb ID) for the selected server.
  const embedUrl = isTv ? server.tvUrl(id, season, episode, imdbId) : server.movieUrl(id, imdbId);

  // Record this view into local Continue Watching history.
  useEffect(() => {
    record({
      id,
      mediaType,
      title: titleName,
      posterUrl,
      ...(isTv ? { season: Number(season), episode: Number(episode) } : {}),
    });
  }, [record, id, mediaType, titleName, posterUrl, isTv, season, episode]);

  // Selecting an episode updates the URL query params (and thus the embed).
  function selectEpisode(nextSeason: number, nextEpisode: number) {
    setDrawerOpen(false);
    router.push(`/watch/${id}?type=tv&season=${nextSeason}&episode=${nextEpisode}`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top bar: back button (left) + server switcher (right) */}
      <div className="absolute inset-x-0 top-4 z-10 flex items-start justify-between gap-2 px-4">
        <Link
          href="/"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.keyCode === 13) {
              e.preventDefault();
              router.push("/");
            }
          }}
          className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface/80 px-4 py-2 text-text-primary backdrop-blur-md transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Back to Browse</span>
        </Link>

        <div className="flex items-center gap-2">
          {isTv && seasons.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  e.preventDefault();
                  setDrawerOpen(true);
                }
              }}
              aria-label="Open episode list"
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface/80 px-3 py-2 text-sm font-semibold text-text-primary backdrop-blur-md transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ListVideo size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                S{season} · E{episode}
              </span>
            </button>
          )}

          <nav
            aria-label="Streaming server"
            className="flex items-center gap-1 rounded-xl border border-border-subtle bg-surface/80 p-1 backdrop-blur-md"
          >
            {STREAM_SERVERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setServerId(s.id); setStreamFailed(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.keyCode === 13) {
                    e.preventDefault();
                    setServerId(s.id);
                    setStreamFailed(false);
                  }
                }}
                aria-pressed={serverId === s.id}
                title={s.name}
                aria-label={`Switch to ${s.name}`}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm ${
                  serverId === s.id && !streamFailed
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Server size={14} aria-hidden="true" />
                {s.name.split(" · ")[0]}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-border-subtle" />
            <button
              type="button"
              onClick={() => setStreamFailed(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  e.preventDefault();
                  setStreamFailed(true);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              Stream Unavailable? Click Here
            </button>
          </nav>
        </div>
      </div>

      {/* Cloud-hosted stream player (re-mounts on server/episode switch via key).
          NOTE: sandbox attribute removed because free third-party streaming hosts 
          explicitly detect it and refuse to load the video if ads are blocked. */}
      {!streamFailed ? (
        <iframe
          key={`${server.id}-${mediaType}-${id}-${season}-${episode}`}
          src={embedUrl}
          referrerPolicy="origin"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="h-full w-full border-0 bg-black"
          title={`Streaming ${titleName} on ${server.name}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-black p-6 text-center">
          <div className="absolute inset-0 z-0 bg-black">
            <img
              src={posterUrl || "/backdrop-fallback.svg"}
              alt={titleName}
              className="absolute inset-0 z-0 w-full h-full object-cover opacity-20 blur-sm"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-black/40" />
          </div>
          
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="mb-6 rounded-full bg-white/10 p-5 backdrop-blur-md">
              <Server size={32} className="text-white" />
            </div>
            <h2 className="mb-3 font-display text-3xl font-bold text-white tracking-tight">
              Stream Unavailable
            </h2>
            <p className="max-w-md text-lg text-white/70">
              Full stream currently unavailable. Watch the trailer above.
            </p>
            <button
              onClick={() => setStreamFailed(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  e.preventDefault();
                  setStreamFailed(false);
                }
              }}
              className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Retry Servers
            </button>
          </div>
        </div>
      )}

      {isTv && seasons.length > 0 && (
        <EpisodeDrawer
          tvId={id}
          seasons={seasons}
          currentSeason={Number(season)}
          currentEpisode={Number(episode)}
          onSelectEpisode={selectEpisode}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}