// CineStream — responsive poster-grid skeleton matching the Browse/Search
// grid breakpoints (2 → 6 columns per SITE_SPEC responsive breakpoints).

import { MediaCardSkeleton } from "./MediaCardSkeleton";

interface MediaGridSkeletonProps {
  count?: number;
}

export function MediaGridSkeleton({ count = 12 }: MediaGridSkeletonProps) {
  return (
    <ul
      aria-hidden="true"
      className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="list-none">
          <MediaCardSkeleton />
        </li>
      ))}
    </ul>
  );
}