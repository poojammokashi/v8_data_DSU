import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useThemeStore } from '@store/themeStore';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-subtle hover:text-ink transition-colors"
    >
      {isDark ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
    </button>
  );
}
