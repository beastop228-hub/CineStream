// CineStream — shared domain types

export type MediaType = "movie" | "tv";

export interface MediaTitle {
  /** TMDB id, or a stable mock id when generated-default catalog data is used. */
  id: string;
  mediaType: MediaType;
  title: string;
  /** Original title for TV shows (series name). */
  originalTitle?: string;
  overview: string;
  /** TMDB poster path (e.g. "/abc.jpg") or a full URL for mock data. */
  posterUrl: string;
  /** TMDB backdrop path or a full URL for mock data. */
  backdropUrl: string;
  /** Optional video trailer URL (e.g., MP4). */
  trailerUrl?: string;
  releaseDate: string; // ISO date
  voteAverage: number; // 0-10
  genres: string[];
  /** 4K/HDR/Dolby quality tags shown as chips. */
  qualityTags: string[];
}