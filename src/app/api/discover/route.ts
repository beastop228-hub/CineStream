// CineStream — discover API: server-side proxy for TMDB /discover so the API
// key is never exposed to the browser. Powers the /browse infinite catalog.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDiscoverMedia } from "@/lib/tmdb";

const querySchema = z.object({
  type: z.enum(["movie", "tv"]).default("movie"),
  sort: z.string().max(60).default("popularity.desc"),
  genre: z.string().regex(/^\d+$/).optional(),
  year: z.string().regex(/^\d{4}$/).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    type: sp.get("type") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    genre: sp.get("genre") ?? undefined,
    year: sp.get("year") ?? undefined,
    page: sp.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid discover parameters." }, { status: 400 });
  }

  const { type, sort, genre, year, page } = parsed.data;
  const result = await getDiscoverMedia(type, page, sort, genre, year);
  return NextResponse.json(result);
}