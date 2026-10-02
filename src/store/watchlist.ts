// CineStream — global watchlist state (Zustand + localStorage persistence)

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  /** Set-like map of `${mediaType}:${id}` -> true for items in the watchlist. */
  items: Record<string, true>;
  toggle: (mediaType: "movie" | "tv", id: string) => boolean;
  has: (mediaType: "movie" | "tv", id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (mediaType, id) => {
        const key = `${mediaType}:${id}`;
        const items = { ...get().items };
        if (items[key]) {
          delete items[key];
          set({ items });
          return false;
        }
        items[key] = true;
        set({ items });
        return true;
      },
      has: (mediaType, id) => Boolean(get().items[`${mediaType}:${id}`]),
    }),
    { name: "cinestream-watchlist" }
  )
);