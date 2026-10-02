// CineStream — watch route: full-screen cloud-stream player for a TMDB title.
// Route: /watch/[id] with optional ?type=movie|tv&season=1&episode=1 (TV only).
// When `type` is omitted, the media type is resolved server-side (movie probed first, then TV).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { StreamPlayer } from "@/components/media/StreamPlayer";
import { getTitleById, getTitleDetails, getTvSeasons, getExternalIds } from "@/lib/tmdb";

const idSchema = z.string().regex(/^\d+$/, "TMDB id must be numeric");
const typeSchema = z.enum(["movie", "tv"]);

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numericOr(value: string | string[] | undefined, fallback: string): string {
  const v = firstString(value);
  return v && /^\d+$/.test(v) ? v : fallback;
}

export async function generateMetadata(props: WatchPageProps): Promise<Metadata> {
  const { id } = await props.params;
  if (!idSchema.safeParse(id).success) return { title: "Watch — CineStream" };
  const parsedType = typeSchema.safeParse(firstString((await props.searchParams).type));
  const typeHint = parsedType.success ? parsedType.data : undefined;
  const title = typeHint
    ? await getTitleDetails(typeHint, id)
    : await getTitleById(id);
  return {
    title: title ? `Watch ${title.title} — CineStream` : "Watch — CineStream",
    description: title?.overview || "Stream movies and series on CineStream.",
  };
}

export default async function WatchPage(props: PageProps<"/watch/[id]">) {
  const { id } = await props.params;
  if (!idSchema.safeParse(id).success) notFound();

  const searchParams = await props.searchParams;
  const parsedType = typeSchema.safeParse(firstString(searchParams.type));
  const typeHint = parsedType.success ? parsedType.data : undefined;
  const season = numericOr(searchParams.season, "1");
  const episode = numericOr(searchParams.episode, "1");

  const title = typeHint
    ? await getTitleDetails(typeHint, id)
    : await getTitleById(id);
  if (!title) notFound();

  // For TV, fetch the season list to power the episode drawer.
  const seasons =
    title.mediaType === "tv" ? await getTvSeasons(id) : [];

  // Fetch external IDs (some fallback servers require IMDb IDs)
  const externalIds = await getExternalIds(title.mediaType, id);
  const imdbId = externalIds?.imdb_id;

  return (
    <StreamPlayer
      mediaType={title.mediaType}
      id={id}
      imdbId={imdbId}
      season={season}
      episode={episode}
      titleName={title.title}
      posterUrl={title.posterUrl}
      seasons={seasons}
    />
  );
}