import { create } from 'zustand';

interface ImageStore {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  imageUrl: null,
  setImageUrl: (url) => set({ imageUrl: url }),
}));