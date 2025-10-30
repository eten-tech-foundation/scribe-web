import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type User } from '@/lib/types';

interface AppState {
  userdetail: User | null;
  userDashboardTab: 'my-work' | 'my-history';
  setUserDetail: (user: User) => void;
  setUserDashboardTab: (tab: 'my-work' | 'my-history') => void;
  clearUserDetail: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      userdetail: null,
      userDashboardTab: 'my-work',
      setUserDetail: (userdetail: User) => set({ userdetail }),
      setUserDashboardTab: (userDashboardTab: 'my-work' | 'my-history') =>
        set({ userDashboardTab }),
      clearUserDetail: () => set({ userdetail: null }),
    }),
    {
      name: 'app-store',
    }
  )
);
