// CineStream — Embla-powered horizontal carousel row.
// Per .cline/skills/embla-carousel.md: dragFree swiping, hover-only edge arrows,
// fixed flex-basis slide widths (2-up mobile → 5-up desktop) to avoid layout shift.

"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaTitle } from "@/lib/types";
import { MediaCard } from "./MediaCard";

interface CarouselRowProps {
  heading: string;
  titles: MediaTitle[];
  /** Section anchor used as the H2 id for aria-labelledby wiring. */
  sectionId: string;
  variant?: "standard" | "top-10" | "genre";
}

export function CarouselRow({ heading, titles, sectionId, variant = "standard" }: CarouselRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Sync arrow enabled-states with Embla. Initial read is deferred to a
  // timeout so no setState runs synchronously inside the effect body.
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    const timer = setTimeout(update, 0);
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      clearTimeout(timer);
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      emblaApi?.scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      emblaApi?.scrollNext();
    }
  }

  const arrowClasses =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-surface/90 text-text-primary shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-text-secondary tv-focus";

  return (
    <section aria-labelledby={sectionId} className="group/row relative py-4">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-8 lg:px-12 2xl:px-[5vw]">
        <h2 id={sectionId} className="flex items-center gap-1 font-display text-lg font-bold text-text-primary sm:text-xl group-hover/row:text-white transition-colors cursor-pointer">
          {heading}
          <ChevronRight size={20} className="text-text-secondary opacity-0 group-hover/row:opacity-100 transition-opacity" />
        </h2>
      </div>

      <div className="relative">
        {/* Hover-only prev/next arrow overlays on row edges */}
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.keyCode === 13) {
              e.preventDefault();
              emblaApi?.scrollPrev();
            }
          }}
          disabled={!canPrev}
          aria-label={`Scroll ${heading} left`}
          className={`${arrowClasses} left-2 opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0 lg:opacity-0`}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.keyCode === 13) {
              e.preventDefault();
              emblaApi?.scrollNext();
            }
          }}
          disabled={!canNext}
          aria-label={`Scroll ${heading} right`}
          className={`${arrowClasses} right-2 opacity-0 group-hover/row:opacity-100 disabled:pointer-events-none disabled:opacity-0 lg:opacity-0`}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        {/* Embla viewport — keyboard-scrollable for WCAG parity */}
        <div
          ref={emblaRef}
          className="overflow-hidden"
          tabIndex={0}
          role="region"
          aria-label={heading}
          onKeyDown={onKeyDown}
        >
          <ul className="flex gap-3 px-4 pb-2 sm:gap-4 sm:px-8 lg:px-12 2xl:px-[5vw]">
            {titles.map((title, i) => (
              <li
                key={`${title.mediaType}-${title.id}`}
                className="list-none min-w-0 shrink-0 grow-0 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <MediaCard title={title} fluid variant={variant} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}