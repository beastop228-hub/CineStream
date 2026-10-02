// CineStream — /search: instant keyword-driven media search per SITE_SPEC.xml.
// The server shell reads ?q= (from the header search bar); the client view
// re-queries /api/search with debounce as the user types.

import type { Metadata } from "next";
import { SearchClient } from "@/components/media/SearchClient";

export const metadata: Metadata = {
  title: "Search — CineStream",
  description: "Search movies and series on CineStream.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage(props: SearchPageProps) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const initialQuery = (typeof raw === "string" ? raw : "").slice(0, 100);

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12">
      <h1 className="font-display text-3xl font-extrabold text-text-primary sm:text-4xl">Search</h1>
      <SearchClient initialQuery={initialQuery} />
    </main>
  );
}