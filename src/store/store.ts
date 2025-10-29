import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type User } from '@/lib/types';

interface AppState {
  userdetail: User | null;
  activeTab: 'my-work' | 'my-history';
  setUserDetail: (user: User) => void;
  setActiveTab: (tab: 'my-work' | 'my-history') => void;
  clearUserDetail: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      userdetail: null,
      activeTab: 'my-work',
      setUserDetail: (userdetail: User) => set({ userdetail }),
      setActiveTab: (activeTab: 'my-work' | 'my-history') => set({ activeTab }),
      clearUserDetail: () => set({ userdetail: null }),
    }),
    {
      name: 'app-store',
    }
  )
);
