// CineStream — atomic Badge/Chip components

import type { ReactNode } from "react";

type BadgeVariant = "quality" | "rating" | "genre" | "status";

const variantClasses: Record<BadgeVariant, string> = {
  quality: "bg-gold/15 text-gold border-gold/40",
  rating: "bg-black/60 text-gold border-gold/40 backdrop-blur-sm",
  genre: "bg-surface/80 text-text-secondary border-border-subtle backdrop-blur-sm",
  status: "bg-accent/15 text-accent border-accent/40",
};

export function Badge({
  variant = "genre",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}