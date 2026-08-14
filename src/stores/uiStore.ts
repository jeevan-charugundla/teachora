import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  activeGenerationId: string | null;
  setActiveGenerationId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  isOnline: navigator.onLine,
  setIsOnline: (isOnline) => set({ isOnline }),
  activeGenerationId: null,
  setActiveGenerationId: (activeGenerationId) => set({ activeGenerationId }),
}));
