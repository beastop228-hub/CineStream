// CineStream — /browse: infinite discover catalog (type, sort, genre + Load More)
// per SITE_SPEC.xml. Genres are fetched server-side; catalog loads client-side
// through the /api/discover server proxy.

import type { Metadata } from "next";
import { BrowseCatalog } from "@/components/media/BrowseCatalog";
import { getGenres } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Browse — CineStream",
  description: "Browse thousands of movies and series available to stream on CineStream.",
};

export default async function BrowsePage() {
  const genres = await getGenres();

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12 2xl:px-[5vw]">
      <div className="border-b border-border-subtle pb-6">
        <h1 className="font-display text-3xl font-extrabold text-text-primary sm:text-4xl">
          Full Library
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Explore thousands of movies and series available to stream.
        </p>
      </div>
      <BrowseCatalog genres={genres} />
    </main>
  );
}