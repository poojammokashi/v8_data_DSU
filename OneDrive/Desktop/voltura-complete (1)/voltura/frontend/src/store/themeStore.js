import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME } from '@config/constants';

function resolveTheme(theme) {
  if (theme === THEME.SYSTEM) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEME.DARK
      : THEME.LIGHT;
  }
  return theme;
}

function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === THEME.DARK);
  return resolved;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: THEME.SYSTEM, // user preference: light | dark | system
      resolvedTheme: THEME.LIGHT, // actual applied theme

      setTheme: (theme) => {
        const resolved = applyTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const next = get().resolvedTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
        get().setTheme(next);
      },

      initTheme: () => {
        const resolved = applyTheme(get().theme);
        set({ resolvedTheme: resolved });
      },
    }),
    { name: 'voltura-theme' }
  )
);
