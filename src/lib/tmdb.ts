// CineStream — TMDB client with mock fallback.
// When TMDB_API_KEY is set, fetches real catalog data from TMDB.
// Otherwise falls back to generated-default mock data so the UI renders
// before credentials exist. All API calls run server-side only.

import { FEATURED_HERO, TRENDING_NOW, TOP_RATED, CONTINUE_WATCHING, NEW_RELEASES } from "./mock-data";
import type { MediaTitle, MediaType } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const ISRG_REVALIDATE = 3600; // 1 hour ISR per SITE_SPEC.xml

interface TmdbMediaResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10765: "Sci-Fi & Fantasy", 10768: "War & Politics",
};

function mapTmdbToMediaTitle(
  result: TmdbMediaResult,
  fallbackMediaType: MediaType
): MediaTitle {
  const isTv = fallbackMediaType === "tv" || result.media_type === "tv";
  return {
    id: String(result.id),
    mediaType: isTv ? "tv" : "movie",
    title: result.title ?? result.name ?? "Untitled",
    overview: result.overview,
    posterUrl: result.poster_path
      ? `${IMAGE_BASE_URL}/w342${result.poster_path}`
      : "",
    backdropUrl: result.backdrop_path
      ? `${IMAGE_BASE_URL}/w1280${result.backdrop_path}`
      : "",
    releaseDate: result.release_date ?? result.first_air_date ?? "",
    voteAverage: Math.round(result.vote_average * 10) / 10,
    genres: (result.genre_ids ?? [])
      .map((gid) => GENRE_MAP[gid])
      .filter(Boolean),
    qualityTags: ["4K UHD", "HDR", "Dolby Atmos"],
  };
}

// TMDB v3 API keys are 32-char hex strings passed as `api_key` query param;
// v4 read access tokens are long JWTs sent as Bearer headers.
const V3_KEY_RE = /^[0-9a-f]{32}$/i;

function getTmdbApiKey(): string | undefined {
  return process.env.TMDB_API_KEY;
}

async function tmdbFetch<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { accept: "application/json" };
  if (V3_KEY_RE.test(apiKey)) {
    url.searchParams.set("api_key", apiKey);
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: ISRG_REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface CatalogSection {
  key: string;
  heading: string;
  titles: MediaTitle[];
}

export async function getCatalogSections(): Promise<CatalogSection[]> {
  const [trending, popularTv, topRated, upcoming] = await Promise.all([
    tmdbFetch<{ results: TmdbMediaResult[] }>("/trending/movie/week", { language: "en-US" }),
    tmdbFetch<{ results: TmdbMediaResult[] }>("/tv/popular", { language: "en-US" }),
    tmdbFetch<{ results: TmdbMediaResult[] }>("/movie/top_rated", { language: "en-US" }),
    tmdbFetch<{ results: TmdbMediaResult[] }>("/movie/upcoming", { language: "en-US" }),
  ]);

  if (trending?.results?.length && popularTv?.results?.length && topRated?.results?.length) {
    const sections: CatalogSection[] = [
      {
        key: "trending-movies",
        heading: "Trending Movies",
        titles: trending.results.slice(0, 14).map((r) => mapTmdbToMediaTitle(r, "movie")),
      },
      {
        key: "popular-series",
        heading: "Popular Series",
        titles: popularTv.results.slice(0, 14).map((r) => mapTmdbToMediaTitle(r, "tv")),
      },
      {
        key: "top-rated",
        heading: "Top Rated",
        titles: topRated.results.slice(0, 14).map((r) => mapTmdbToMediaTitle(r, "movie")),
      },
    ];
    if (upcoming?.results?.length) {
      sections.push({
        key: "upcoming",
        heading: "New & Upcoming",
        titles: upcoming.results.slice(0, 14).map((r) => mapTmdbToMediaTitle(r, "movie")),
      });
    }
    return sections;
  }

  // Generated-default fallback (no TMDB_API_KEY configured).
  return [
    { key: "trending", heading: "Trending Now", titles: TRENDING_NOW },
    { key: "top-rated", heading: "Top Rated", titles: TOP_RATED },
    { key: "continue-watching", heading: "Continue Watching", titles: CONTINUE_WATCHING },
    { key: "new-releases", heading: "New & Upcoming", titles: NEW_RELEASES },
  ];
}

export async function getTitleDetails(
  mediaType: MediaType,
  id: string
): Promise<MediaTitle | null> {
  const data = await tmdbFetch<TmdbMediaResult>(`/${mediaType}/${id}`, { language: "en-US" });
  return data ? mapTmdbToMediaTitle(data, mediaType) : null;
}

// Resolves a bare TMDB id to its title by probing movie first, then TV.
// Used by /watch/[id] where the media type is not part of the URL.
export async function getTitleById(id: string): Promise<MediaTitle | null> {
  return (await getTitleDetails("movie", id)) ?? getTitleDetails("tv", id);
}

export interface TvSeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterUrl: string;
}

export interface TvEpisodeSummary {
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
  stillUrl: string;
}

// TV seasons for the episode drawer (specials with season_number 0 are excluded).
export async function getTvSeasons(id: string): Promise<TvSeasonSummary[]> {
  const data = await tmdbFetch<{
    seasons?: {
      season_number: number;
      name: string;
      episode_count: number;
      poster_path: string | null;
    }[];
  }>(`/tv/${id}`, { language: "en-US" });
  return (data?.seasons ?? [])
    .filter((s) => s.season_number > 0)
    .map((s) => ({
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      posterUrl: s.poster_path ? `${IMAGE_BASE_URL}/w185${s.poster_path}` : "",
    }));
}

// Episodes for a specific season, used to populate the episode drawer.
export async function getTvSeasonEpisodes(
  id: string,
  seasonNumber: string
): Promise<TvEpisodeSummary[]> {
  const data = await tmdbFetch<{
    episodes?: {
      episode_number: number;
      name: string;
      overview: string;
      runtime: number | null;
      still_path: string | null;
    }[];
  }>(`/tv/${id}/season/${seasonNumber}`, { language: "en-US" });
  return (data?.episodes ?? []).map((e) => ({
    episodeNumber: e.episode_number,
    name: e.name,
    overview: e.overview,
    runtime: e.runtime ?? null,
    stillUrl: e.still_path ? `${IMAGE_BASE_URL}/w300${e.still_path}` : "",
  }));
}

export interface GenreOption {
  id: number;
  name: string;
}

// Genre lists for the /browse filter bar (movie + TV combined, deduplicated).
export async function getGenres(): Promise<GenreOption[]> {
  const [movieGenres, tvGenres] = await Promise.all([
    tmdbFetch<{ genres: GenreOption[] }>("/genre/movie/list", { language: "en-US" }),
    tmdbFetch<{ genres: GenreOption[] }>("/genre/tv/list", { language: "en-US" }),
  ]);
  const merged = new Map<number, string>();
  for (const g of [...(movieGenres?.genres ?? []), ...(tvGenres?.genres ?? [])]) {
    if (!merged.has(g.id)) merged.set(g.id, g.name);
  }
  return [...merged.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Multi-search (movies + TV). Person results are filtered out.
export async function searchTitles(query: string): Promise<MediaTitle[]> {
  return searchFullCatalog(query, 1);
}

// Paginated global multi-search across the entire TMDB catalog.
export async function searchFullCatalog(query: string, page = 1): Promise<MediaTitle[]> {
  const data = await tmdbFetch<{ results: TmdbMediaResult[] }>("/search/multi", {
    language: "en-US",
    query,
    page: String(page),
    include_adult: "false",
  });
  return (data?.results ?? [])
    .filter((r) => r.media_type === "movie" || r.media_type === "tv" || (!r.media_type && (r.title || r.name)))
    .map((r) => mapTmdbToMediaTitle(r, r.media_type === "tv" ? "tv" : "movie"));
}

export interface DiscoverResult {
  titles: MediaTitle[];
  page: number;
  totalPages: number;
}

// Full infinite discovery by type, genre, year, and sort (TMDB /discover).
// Normalizes sort keys per media type and guards rating sorts with a vote-count floor.
export async function getDiscoverMedia(
  type: MediaType,
  page = 1,
  sortBy = "popularity.desc",
  genreId?: string,
  year?: string
): Promise<DiscoverResult> {
  let sort = sortBy;
  if (type === "tv" && sort === "primary_release_date.desc") sort = "first_air_date.desc";

  const params: Record<string, string> = {
    page: String(page),
    sort_by: sort,
    include_adult: "false",
  };
  if (sort.startsWith("vote_average")) params["vote_count.gte"] = "300";
  if (genreId) params.with_genres = genreId;
  if (year) {
    if (type === "movie") params.primary_release_year = year;
    else params.first_air_date_year = year;
  }
  const data = await tmdbFetch<{
    results: TmdbMediaResult[];
    page: number;
    total_pages: number;
  }>(`/discover/${type}`, params);
  return {
    titles: (data?.results ?? []).map((r) => mapTmdbToMediaTitle(r, type)),
    page: data?.page ?? page,
    totalPages: Math.min(data?.total_pages ?? 1, 500), // TMDB hard-caps pages at 500
  };
}

// Generic trending feed (type: movie | tv | all; window: day | week).
export async function getTrending(
  type: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "day"
): Promise<MediaTitle[]> {
  const data = await tmdbFetch<{ results: TmdbMediaResult[] }>(
    `/trending/${type}/${timeWindow}`,
    { language: "en-US" }
  );
  return (data?.results ?? []).map((r) =>
    mapTmdbToMediaTitle(r, r.media_type === "tv" ? "tv" : "movie")
  );
}

export async function getFeaturedTitles(): Promise<MediaTitle[]> {
  const trending = await tmdbFetch<{ results: TmdbMediaResult[] }>("/trending/all/week", {
    language: "en-US",
  });
  
  if (trending?.results && trending.results.length > 0) {
    const topResults = trending.results.slice(0, 5);
    
    return topResults.map((r) => {
      const mediaType = r.media_type === "tv" ? "tv" : "movie";
      return mapTmdbToMediaTitle(r, mediaType);
    });
  }

  // Fallback to mock data if TMDB fetch fails
  return [
    FEATURED_HERO,
  ];
}

export async function searchMulti(query: string): Promise<MediaTitle[]> {
  if (!query.trim()) return [];
  
  const data = await tmdbFetch<{ results: TmdbMediaResult[] }>("/search/multi", {
    query: query.trim(),
    language: "en-US",
    page: "1",
    include_adult: "false"
  });
  
  if (!data?.results) return [];
  
  // Filter out people or unknown types, only keep movie/tv
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => mapTmdbToMediaTitle(r, r.media_type as "movie" | "tv"));
}