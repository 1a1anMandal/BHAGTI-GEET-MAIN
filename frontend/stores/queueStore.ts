import { create } from 'zustand';
import { QueueItem } from '@bhagi-geet/shared';

interface QueueStoreState {
  queue: QueueItem[];
  votes: Array<{ bhajanId: string; title: string; count: number }>;
  setQueue: (queue: QueueItem[]) => void;
  setVotes: (votes: Array<{ bhajanId: string; title: string; count: number }>) => void;
}

export const useQueueStore = create<QueueStoreState>((set) => ({
  queue: [],
  votes: [],
  
  setQueue: (queue) => set({ queue }),
  setVotes: (votes) => set({ votes }),
}));
