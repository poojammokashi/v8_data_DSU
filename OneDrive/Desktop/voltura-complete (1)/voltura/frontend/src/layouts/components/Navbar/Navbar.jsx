import { HiOutlineBars3, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useUIStore } from '@store/uiStore';
import Breadcrumbs from '../Breadcrumbs';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { toggleMobileNav } = useUIStore();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border-subtle bg-surface/80 backdrop-blur-md px-4 lg:px-6">
      <button
        onClick={toggleMobileNav}
        aria-label="Open menu"
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-subtle"
      >
        <HiOutlineBars3 className="h-5 w-5" />
      </button>

      <Breadcrumbs />

      {/* Search — desktop only, expands available space */}
      <div className="relative flex-1 max-w-md hidden sm:block ml-1">
        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          type="search"
          placeholder="Search transactions, reports, users…"
          className="w-full h-9 rounded-xl border border-border bg-surface-subtle pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-surface-raised transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <ThemeToggle />
        <NotificationBell />
        <span className="w-px h-6 bg-border mx-1" />
        <UserMenu />
      </div>
    </header>
  );
}
