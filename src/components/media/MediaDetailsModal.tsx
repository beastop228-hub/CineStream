/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Play, Plus, MessageSquare, Star, ChevronDown } from "lucide-react";
import { useModalStore } from "@/store/modal";
import { useWatchlistStore } from "@/store/watchlist";
import useEmblaCarousel from "embla-carousel-react";

export function MediaDetailsModal() {
  const router = useRouter();
  const { isOpen, mediaId, mediaType, closeModal } = useModalStore();
  const { has, toggle } = useWatchlistStore();
  
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [omdbData, setOmdbData] = useState<any | null>(null);

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const normalizedType = mediaType === "series" ? "tv" : mediaType;
  const inList = normalizedType && mediaId ? has(normalizedType, mediaId) : false;

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscape);
      // Reset state when closing
      setTimeout(() => {
        setData(null);
        setOmdbData(null);
        setSelectedSeason(1);
        setEpisodes([]);
      }, 300);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (isOpen && mediaId && mediaType) {
      setTimeout(() => {
        setLoading(true);
        setError(false);
      }, 0);
      fetch(`/api/title/${mediaId}?type=${mediaType}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
          if (mediaType === "series" || mediaType === "tv") {
            const defaultSeason = json.seasons?.find((s: any) => s.season_number > 0)?.season_number || 1;
            setSelectedSeason(defaultSeason);
          }
          
          if (json.external_ids?.imdb_id) {
            const omdbKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
            if (omdbKey) {
              fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${json.external_ids.imdb_id}`)
                .then((r) => r.json())
                .then((omdbJson) => {
                  if (omdbJson.Response !== "False") {
                    setOmdbData(omdbJson);
                  }
                })
                .catch(console.error);
            }
          }
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [isOpen, mediaId, mediaType]);

  useEffect(() => {
    if ((mediaType === "series" || mediaType === "tv") && mediaId && selectedSeason > 0 && isOpen) {
      fetch(`/api/tv/season?id=${mediaId}&season=${selectedSeason}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.episodes && Array.isArray(json.episodes)) setEpisodes(json.episodes);
        })
        .catch(() => setEpisodes([]));
    }
  }, [mediaId, mediaType, selectedSeason, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />
      
      {/* Modal Container */}
      <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-2xl transition-all">
        {loading && !data && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        )}
        
        {error && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-center">
            <p className="text-text-primary">Failed to load media details.</p>
            <button onClick={closeModal} className="rounded-lg bg-surface-lighter px-4 py-2 font-medium hover:bg-border-subtle">
              Close
            </button>
          </div>
        )}

        {data && (
          <div className="flex-1 overflow-y-auto">
            {/* Top Bar absolute positioned over hero */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-xs font-bold tracking-widest text-text-secondary uppercase">
                {mediaType === "movie" ? "FILM" : "SERIES"} &middot; #{mediaId}
              </span>
              <button 
                onClick={closeModal}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.keyCode === 13) {
                    e.preventDefault();
                    closeModal();
                  }
                }}
                tabIndex={0}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-text-primary hover:bg-black/60 transition-colors tv-focus"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hero / Banner Area */}
            <div className="relative h-64 sm:h-80 md:h-[400px] w-full bg-surface-lighter">
              {data.backdrop_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w1280${data.backdrop_path}`}
                  alt={data.title || data.name}
                  fill
                  unoptimized={true}
                  className="object-cover"
                  priority
                />
              )}
              {/* Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>

            {/* Main Content Layout */}
            <div className="relative z-10 px-4 sm:px-8 pb-8 -mt-24 sm:-mt-32">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster */}
                <div className="shrink-0">
                  <div className="relative pt-[150%] w-32 sm:w-48 overflow-hidden rounded-lg border-2 border-white/10 shadow-xl">
                    <Image
                      src={data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : "/poster-fallback.svg"}
                      alt={data.title || data.name}
                      fill
                      unoptimized={true}
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Title & Metadata & Actions */}
                <div className="flex flex-col justify-end pt-4 sm:pt-0">
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-3">
                    {data.title || data.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium mb-6">
                    <span className="text-green-500">{(data.vote_average * 10).toFixed(0)}% Match</span>
                    <span className="text-text-secondary">{data.release_date ? data.release_date.slice(0, 4) : (data.first_air_date ? data.first_air_date.slice(0, 4) : "")}</span>
                    <span className="text-text-secondary">
                      {mediaType === 'movie' 
                        ? `${data.runtime || '?'}m` 
                        : `${data.number_of_seasons || 1} Season${data.number_of_seasons > 1 ? 's' : ''}`}
                    </span>
                    <span className="rounded border border-border-subtle px-1 text-xs text-text-secondary">HD</span>
                    <span className="flex items-center gap-1 text-text-primary" title="TMDB Rating">
                      <Star size={14} className="fill-gold text-gold" />
                      {data.vote_average?.toFixed(1)}
                    </span>
                    {omdbData?.imdbRating && omdbData.imdbRating !== "N/A" && (
                      <span className="flex items-center gap-1 text-text-primary" title="IMDb Rating">
                        <span className="rounded bg-[#f5c518] px-1 text-[10px] font-black text-black">IMDb</span>
                        {omdbData.imdbRating}
                      </span>
                    )}
                    {omdbData?.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes") && (
                      <span className="flex items-center gap-1 text-text-primary" title="Rotten Tomatoes">
                        <span className="rounded bg-[#fa320a] px-1 text-[10px] font-black text-white">RT</span>
                        {omdbData.Ratings.find((r: any) => r.Source === "Rotten Tomatoes").Value}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        closeModal();
                        router.push(`/watch/${mediaId}?type=${mediaType}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.keyCode === 13) {
                          e.preventDefault();
                          closeModal();
                          router.push(`/watch/${mediaId}?type=${mediaType}`);
                        }
                      }}
                      tabIndex={0}
                      className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-semibold text-black transition-transform hover:scale-105 tv-focus"
                    >
                      <Play size={20} className="fill-black" /> Play
                    </button>
                    
                    <button 
                      onClick={() => toggle(normalizedType!, mediaId!)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.keyCode === 13) {
                          e.preventDefault();
                          toggle(normalizedType!, mediaId!);
                        }
                      }}
                      tabIndex={0}
                      className="flex items-center gap-2 rounded-lg bg-surface-lighter px-4 py-2.5 font-medium text-text-primary border border-border-subtle hover:bg-border-subtle transition-colors tv-focus"
                    >
                      {inList ? <X size={18} /> : <Plus size={18} />}
                      {inList ? "Remove" : "Add to list"}
                      <ChevronDown size={16} className="ml-1 opacity-60" />
                    </button>
                    
                    <button 
                      tabIndex={0} 
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.keyCode === 13) {
                          e.preventDefault();
                        }
                      }}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-surface-lighter border border-border-subtle hover:bg-border-subtle transition-colors tv-focus"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border-subtle pt-8">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-2">Synopsis</h3>
                  <p className="text-text-primary leading-relaxed">
                    {data.overview || "No synopsis available."}
                  </p>
                </div>
                
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-2">Genres</h3>
                    <p className="text-text-primary text-sm">
                      {data.genres?.map((g: any) => g.name).join(", ") || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-2">Status</h3>
                    <p className="text-text-primary text-sm">{data.status || "Released"}</p>
                  </div>
                </div>
              </div>

              {/* Cast Section */}
              {data.credits?.cast?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-bold text-text-secondary mb-4"><span className="text-text-primary/50 mr-2">[01]</span> Cast</h3>
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4">
                      {data.credits.cast.slice(0, 15).map((person: any) => (
                        <div key={person.id} className="shrink-0 flex flex-col items-center w-[80px]">
                          <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full border border-border-subtle bg-surface-lighter">
                            {person.profile_path ? (
                              <Image 
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                fill
                                unoptimized={true}
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-border-subtle" />
                            )}
                          </div>
                          <span className="mt-2 text-center text-xs font-bold text-text-primary line-clamp-1">{person.name}</span>
                          <span className="text-center text-[10px] text-text-secondary line-clamp-1">{person.character}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Bottom Section */}
              <div className="mt-12">
                {(mediaType === "movie") ? (
                  <>
                    <h3 className="text-sm font-bold text-text-secondary mb-4 flex items-center gap-2">
                      <MessageSquare size={16} /> Comments
                    </h3>
                    <div className="mb-10 rounded-lg border border-border-subtle bg-background p-4">
                      <p className="text-sm text-text-secondary">Sign in to join the conversation...</p>
                    </div>

                    {data.similar?.results?.length > 0 && (
                      <>
                        <h3 className="text-xl font-bold text-text-primary mb-4">More like this</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {data.similar.results.slice(0, 5).map((item: any) => (
                            <Link 
                              key={item.id} 
                              href={`/watch/${item.id}?type=movie`}
                              onClick={closeModal}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.keyCode === 13) {
                                  e.preventDefault();
                                  closeModal();
                                  router.push(`/watch/${item.id}?type=movie`);
                                }
                              }}
                              className="group relative pt-[150%] overflow-hidden rounded-lg border border-border-subtle transition-transform hover:scale-105 tv-focus"
                            >
                              <Image 
                                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/poster-fallback.svg"}
                                alt={item.title}
                                fill
                                unoptimized={true}
                                className="object-cover"
                              />
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-text-secondary"><span className="text-text-primary/50 mr-2">[02]</span> Episodes</h3>
                      
                      {data.seasons?.length > 0 && (
                        <select 
                          value={selectedSeason}
                          onChange={(e) => setSelectedSeason(Number(e.target.value))}
                          className="bg-surface-lighter border border-border-subtle text-text-primary text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent appearance-none pr-8 relative"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                        >
                          {data.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                            <option key={season.id} value={season.season_number}>
                              Season {season.season_number}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {episodes.map((ep: any) => (
                        <Link 
                          key={ep.episodeNumber}
                          href={`/watch/${mediaId}?type=tv&season=${selectedSeason}&episode=${ep.episodeNumber}`}
                          onClick={closeModal}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.keyCode === 13) {
                              e.preventDefault();
                              closeModal();
                              router.push(`/watch/${mediaId}?type=tv&season=${selectedSeason}&episode=${ep.episodeNumber}`);
                            }
                          }}
                          className="group flex flex-col sm:flex-row gap-4 p-3 rounded-lg border border-transparent hover:border-border-subtle hover:bg-surface-lighter transition-colors tv-focus"
                        >
                          <div className="relative pt-[56.25%] w-full sm:w-40 shrink-0 overflow-hidden rounded-md bg-border-subtle">
                            {ep.stillUrl ? (
                              <Image src={ep.stillUrl} alt={ep.name} fill unoptimized={true} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-text-secondary opacity-50">
                                <Play size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 py-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-text-primary text-sm">{ep.episodeNumber}. {ep.name}</h4>
                              {ep.runtime && <span className="text-xs text-text-secondary shrink-0 ml-2">{ep.runtime}m</span>}
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-3">{ep.overview || "No description available."}</p>
                          </div>
                        </Link>
                      ))}
                      {episodes.length === 0 && (
                        <div className="py-8 text-center text-sm text-text-secondary">
                          No episodes available for this season.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
