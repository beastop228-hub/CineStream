// CineStream — /browse route loading state: pulse skeleton grid while the
// TMDB catalog is fetched (per .cline/skills/shadcn-ui.md).

import { MediaGridSkeleton } from "@/components/media/MediaGridSkeleton";

export default function BrowseLoading() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12">
      <div aria-hidden="true">
        <div className="h-9 w-64 animate-pulse rounded-md bg-surface" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-md bg-surface" />
        <div className="mt-6 h-14 w-full animate-pulse rounded-2xl bg-surface" />
      </div>
      <MediaGridSkeleton count={12} />
    </main>
  );
}