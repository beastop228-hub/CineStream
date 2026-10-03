"use client";

import { useEffect } from "react";
import { isSmartTV } from "@/lib/tv-detect";

export function ClientTVDetector() {
  useEffect(() => {
    if (isSmartTV()) {
      document.documentElement.setAttribute("data-is-tv", "true");
    }
  }, []);

  return null;
}
