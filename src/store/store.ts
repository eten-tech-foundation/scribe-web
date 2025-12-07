import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ProjectItem, type User } from '@/lib/types';

interface AppState {
  userdetail: User | null;
  userDashboardTab: 'my-work' | 'my-history';
  currentProjectItem: ProjectItem | null;
  _hasHydrated: boolean;
  setUserDetail: (user: User) => void;
  setUserDashboardTab: (tab: 'my-work' | 'my-history') => void;
  setCurrentProjectItem: (projectItem: ProjectItem | null) => void;
  clearUserDetail: () => void;
  clearCurrentProjectItem: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      userdetail: null,
      userDashboardTab: 'my-work',
      currentProjectItem: null,
      _hasHydrated: false,
      setUserDetail: (userdetail: User) => set({ userdetail }),
      setUserDashboardTab: (userDashboardTab: 'my-work' | 'my-history') =>
        set({ userDashboardTab }),
      setCurrentProjectItem: (currentProjectItem: ProjectItem | null) =>
        set({ currentProjectItem }),
      clearUserDetail: () => set({ userdetail: null }),
      clearCurrentProjectItem: () => set({ currentProjectItem: null }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'app-store',
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
