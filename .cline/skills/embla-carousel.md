# Skill: Embla Carousel for Streaming Rows (repo: davidjerleke/embla-carousel)

## Core Principles
- Install: `npm install embla-carousel-react embla-carousel-autoplay`.
- Implementation:
  - Use `useEmblaCarousel({ loop: false, align: "start", dragFree: true })`.
  - Enable smooth trackpad and touch swiping across media cards.
  - Add discreet prev/next arrow overlays on row edges that appear only on hover.
  - Avoid layout shift by giving all slide items fixed flex widths: `flex: 0 0 calc(100% / 2)` on mobile, `flex: 0 0 calc(100% / 5)` on desktop.

## When to use
Upgrading or replacing the custom scroll-snap `CarouselRow` (`src/components/media/CarouselRow.tsx`) with a physics-based carousel: drag momentum, autoplay, progress bars, snap points.

## Setup
```bash
npm install embla-carousel-react
# optional plugins
npm install embla-carousel-autoplay embla-carousel-fade
```

## Core usage (App Router, client component)
```tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";

const [emblaRef, emblaApi] = useEmblaCarousel(
  { loop: false, align: "start", dragFree: true },
  [Autoplay({ delay: 4000, stopOnInteraction: true })]
);

return (
  <div ref={emblaRef} className="overflow-hidden">
    <div className="flex gap-4">
      {titles.map((t) => <MediaCard key={t.id} title={t} />)}
    </div>
  </div>
);
```

## CineStream integration notes
- Slide widths: use fixed flex bases to avoid layout shift — `flex: 0 0 calc(100% / 2)` on mobile, `flex: 0 0 calc(100% / 5)` on desktop (Tailwind: `basis-1/2 lg:basis-1/5`). This supersedes the older fixed-pixel card widths when used inside Embla.
- Hover-only prev/next arrow overlays on row edges: `opacity-0 group-hover/row:opacity-100` on the button chrome, positioned over the viewport edges.
- Respect `prefers-reduced-motion` (SITE_SPEC a11y): disable Autoplay plugin when `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.
- Use `emblaApi.on("select")` for prev/next button enabled states and scroll progress; clean up listeners in effect return.
- Keyboard: Embla is not keyboard-scrollable by default — keep the existing `tabIndex={0}` + arrow-key handler on the viewport for WCAG parity.
- Buttons: `emblaApi.scrollPrev()` / `scrollNext()`; wire to existing ChevronLeft/Right chrome.

## Gotchas
- Embla needs the viewport `overflow-hidden` and a flex track — do not wrap slides in a grid.
- Re-render loops: pass options via the hook's first arg only when static; use `emblaApi.reInit()` when options change dynamically.
- SSR-safe: `emblaRef` renders a plain div on the server; no hydration mismatch risk.