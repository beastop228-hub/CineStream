// CineStream — local "Continue Watching" history (Zustand + localStorage).
// Records the title id, name, poster, type, and optional TV position whenever
// the watch page opens. Used by the home-page Continue Watching row.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HistoryEntry {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterUrl: string;
  season?: number;
  episode?: number;
  /** Epoch ms of the most recent view; used to order newest-first. */
  viewedAt: number;
}

interface HistoryState {
  entries: HistoryEntry[];
  record: (entry: Omit<HistoryEntry, "viewedAt">) => void;
  clear: () => void;
}

const MAX_ENTRIES = 20;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      record: (entry) => {
        const key = `${entry.mediaType}:${entry.id}`;
        const rest = get().entries.filter((e) => `${e.mediaType}:${e.id}` !== key);
        const next = [{ ...entry, viewedAt: Date.now() }, ...rest].slice(0, MAX_ENTRIES);
        set({ entries: next });
      },
      clear: () => set({ entries: [] }),
    }),
    { name: "cinestream-history" }
  )
);