import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  loading: boolean;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  loading: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setLoading: (loading) => set({ loading }),
}));