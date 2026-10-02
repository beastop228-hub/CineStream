import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  mediaId: string | null;
  mediaType: "movie" | "series" | "tv" | null;
  openModal: (id: string, type: "movie" | "series" | "tv") => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  mediaId: null,
  mediaType: null,
  openModal: (id, type) => set({ isOpen: true, mediaId: id, mediaType: type }),
  closeModal: () => set({ isOpen: false, mediaId: null, mediaType: null }),
}));