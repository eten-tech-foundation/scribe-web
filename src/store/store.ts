import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type User } from '@/lib/types';

interface AppState {
  userdetail: User | null;
  setUserDetail: (user: User) => void;
  clearUserDetail: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      userdetail: null, // Initial null user
      setUserDetail: (userdetail: User) => set({ userdetail }),
      clearUserDetail: () => set({ userdetail: null }),
    }),
    {
      name: 'app-store',
    }
  )
);
