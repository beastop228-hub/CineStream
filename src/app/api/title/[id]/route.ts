import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie";
  
  // Await the params object (Next.js 15+ requirement, safe in 14.x depending on config, but Next.js App Router dynamic route params are promises in later versions. Let's use standard `params.id` if not a promise, or await it.)
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing TMDB API key" }, { status: 500 });
  }

  const V3_KEY_RE = /^[0-9a-f]{32}$/i;
  const url = new URL(`https://api.themoviedb.org/3/${type}/${id}`);
  url.searchParams.set("append_to_response", "credits,similar");
  url.searchParams.set("language", "en-US");

  const headers: Record<string, string> = { accept: "application/json" };
  if (V3_KEY_RE.test(apiKey)) {
    url.searchParams.set("api_key", apiKey);
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
