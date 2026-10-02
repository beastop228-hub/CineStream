// CineStream — poster-shaped pulse skeleton matching MediaCard geometry
// (per .cline/skills/shadcn-ui.md: skeleton for TMDB poster loading states).

import { Skeleton } from "@/components/ui/Skeleton";

export function MediaCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[2/3] w-full rounded-xl border border-border-subtle" />
      <Skeleton className="mt-2 h-3.5 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/2" />
    </div>
  );
}