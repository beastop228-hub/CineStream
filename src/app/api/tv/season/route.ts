// CineStream — TV season episodes API: server-side proxy for TMDB
// /tv/{id}/season/{n} so the API key never reaches the browser.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTvSeasonEpisodes } from "@/lib/tmdb";

const querySchema = z.object({
  id: z.string().regex(/^\d+$/),
  season: z.string().regex(/^\d+$/),
});

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    id: sp.get("id") ?? "",
    season: sp.get("season") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id or season." }, { status: 400 });
  }

  const episodes = await getTvSeasonEpisodes(parsed.data.id, parsed.data.season);
  return NextResponse.json({ episodes });
}