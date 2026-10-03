"use client";

import { useEffect } from "react";
import { isSmartTV } from "@/lib/tv-detect";
import { SpatialNavigation } from "./SpatialNavigation";

export function ClientTVDetector() {
  useEffect(() => {
    if (isSmartTV()) {
      document.documentElement.setAttribute("data-is-tv", "true");
    }
  }, []);

  // Always mount spatial navigation — it only activates on arrow keys,
  // which are harmless on desktop (users use mouse). On TV, this is the
  // ONLY way to navigate the website.
  return <SpatialNavigation />;
}
