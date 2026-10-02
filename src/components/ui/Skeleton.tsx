// CineStream — shadcn/ui Skeleton primitive (copied-in-repo pattern per
// .cline/skills/shadcn-ui.md). Pulse-loading placeholder for async content.

import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-surface ${className}`}
      {...props}
    />
  );
}