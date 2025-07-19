
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Prompt } from '@/types';

interface PromptState {
  results: Prompt[];
  setResults: (results: Prompt[]) => void;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set) => ({
      results: [],
      setResults: (results) => set({ results }),
    }),
    {
      name: 'prompt-results-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
