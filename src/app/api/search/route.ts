// CineStream — instant search API: proxies TMDB multi-search server-side
// so the API key is never exposed to the browser.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchTitles } from "@/lib/tmdb";

const querySchema = z.string().trim().min(1).max(100);

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const parsed = querySchema.safeParse(q);
  if (!parsed.success) {
    return NextResponse.json({ error: "Query must be 1-100 characters." }, { status: 400 });
  }

  const results = await searchTitles(parsed.data);
  return NextResponse.json({ query: parsed.data, results });
}