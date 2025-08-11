import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
  role: number;
  organization: number;
  firstName?: string;
  lastName?: string;
  status?: string;
}

interface AppState {
  userdetail: User | null;
  count: number;
  setUserDetail: (user: User) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      userdetail: null, // Initial null user
      count: 0,
      setUserDetail: (userdetail: User) => set({ userdetail }),
      increment: () => set(state => ({ count: state.count + 1 })),
      decrement: () => set(state => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'app-store',
    }
  )
);
