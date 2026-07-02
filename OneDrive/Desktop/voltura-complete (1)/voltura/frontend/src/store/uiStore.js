import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false, // desktop: icon-only rail
      mobileNavOpen: false, // mobile: drawer

      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      openMobileNav: () => set({ mobileNavOpen: true }),
      closeMobileNav: () => set({ mobileNavOpen: false }),
      toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
    }),
    {
      name: 'voltura-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
