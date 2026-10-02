// CineStream — /search route loading state: pulse skeleton grid while the
// search shell initializes (per .cline/skills/shadcn-ui.md).

import { MediaGridSkeleton } from "@/components/media/MediaGridSkeleton";

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12">
      <div aria-hidden="true">
        <div className="h-9 w-32 animate-pulse rounded-md bg-surface" />
        <div className="mt-6 h-12 w-full max-w-xl animate-pulse rounded-full bg-surface" />
      </div>
      <MediaGridSkeleton count={6} />
    </main>
  );
}