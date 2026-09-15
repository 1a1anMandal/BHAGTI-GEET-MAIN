import { create } from 'zustand';
import { Bhajan } from '@bhagi-geet/shared';

interface LyricsStoreState {
  currentBhajan: Bhajan | null;
  activeParaIdx: number;
  setBhajan: (bhajan: Bhajan | null, startIdx?: number) => void;
  setActiveParaIdx: (idx: number) => void;
}

export const useLyricsStore = create<LyricsStoreState>((set) => ({
  currentBhajan: null,
  activeParaIdx: 0,
  
  setBhajan: (bhajan, startIdx = 0) => set({ currentBhajan: bhajan, activeParaIdx: startIdx }),
  setActiveParaIdx: (idx) => set({ activeParaIdx: idx }),
}));
