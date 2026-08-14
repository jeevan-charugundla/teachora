import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isPasswordRecovery: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  isPasswordRecovery: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsPasswordRecovery: (isPasswordRecovery) => set({ isPasswordRecovery }),
  reset: () => set({ user: null, session: null, profile: null, isLoading: false, isPasswordRecovery: false }),
}));
