// CineStream — Home landing page (ISR, 1-hour revalidation per SITE_SPEC.xml)

import { HeroBanner } from "@/components/media/HeroBanner";
import { CarouselRow } from "@/components/media/CarouselRow";
import { ContinueWatchingRow } from "@/components/media/ContinueWatchingRow";
import { getCatalogSections, getFeaturedTitles } from "@/lib/tmdb";

// ISR: regenerate at most once per hour.
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, sections] = await Promise.all([
    getFeaturedTitles(),
    getCatalogSections(),
  ]);

  return (
    <>
      <HeroBanner titles={featured} />
      <div className="relative z-10 -mt-10 pb-12">
        {/* Local viewing history (client-rendered; hidden until populated) */}
        <ContinueWatchingRow />
        {sections.map((section, index) => {
          // Map different sections to our new Apple TV+ variants for visual variety
          let variant: "standard" | "top-10" | "genre" = "standard";
          if (index === 0) variant = "top-10"; // E.g., Trending Movies -> Top 10
          if (index === 2) variant = "genre";  // E.g., Top Rated -> Genre style cards
          
          return (
            <CarouselRow
              key={section.key}
              heading={section.heading}
              titles={section.titles}
              sectionId={`section-${section.key}`}
              variant={variant}
            />
          );
        })}
      </div>
    </>
  );
}
