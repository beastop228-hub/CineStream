// CineStream — cinematic hero banner (backdrop, gradient masks, mute toggle, CTAs)

"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import type { MediaTitle } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface HeroBannerProps {
  titles: MediaTitle[];
}

export function HeroBanner({ titles }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTitle = titles[activeIndex];
  
  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % titles.length);
  }, [titles.length]);

  // Auto-advance the carousel every 8 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!activeTitle) return null;

  return (
    <section aria-labelledby="hero-heading" className="relative min-h-[70vh] w-full sm:min-h-[80vh] overflow-hidden bg-black">
      {titles.map((title, index) => {
        const isActive = index === activeIndex;
        
        return (
          <div 
            key={title.id} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-hidden={!isActive}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 bg-black">
              <img
                src={title.backdropUrl || "/backdrop-fallback.svg"}
                alt={title.title}
                className="absolute inset-0 z-0 w-full h-full object-cover"
              />
              {/* Cinematic gradient mask fading into pure black at the bottom */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* UI Content Layer */}
            <div className="relative z-20 flex min-h-[70vh] flex-col justify-end px-4 pb-20 pt-40 sm:min-h-[80vh] sm:px-8 lg:px-12 2xl:px-[5vw] pointer-events-none">
              <div className="max-w-2xl text-center sm:text-left pointer-events-auto">
                <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">
                  Stream Without Limits. Unlimited Stories, Zero Interruption.
                </p>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="status">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    Available Now
                  </Badge>
                  {title.qualityTags.map((tag) => (
                    <Badge key={tag} variant="quality">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="font-display text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                  {title.title}
                </h1>

                <div className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
                  <span className="flex items-center gap-1 font-semibold text-gold">
                    <Star size={14} className="fill-gold" aria-hidden="true" />
                    {title.voteAverage.toFixed(1)}
                  </span>
                  <span>{title.releaseDate.slice(0, 4)}</span>
                  <span aria-hidden="true">•</span>
                  <span>{title.genres.join(", ")}</span>
                </div>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg line-clamp-3">
                  {title.overview}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <Link href={`/watch/${title.id}?type=${title.mediaType}`} tabIndex={0} className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold transition-colors tv-focus">
                    Watch Now
                  </Link>
                  <button
                    type="button"
                    tabIndex={0}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30 tv-focus"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
        
      {/* Carousel Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {titles.map((title, index) => (
          <button
            key={title.id}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}