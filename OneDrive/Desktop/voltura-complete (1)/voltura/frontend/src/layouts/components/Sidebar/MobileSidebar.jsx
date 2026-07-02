import { NavLink } from 'react-router-dom';
import { HiOutlineBoltSlash } from 'react-icons/hi2';
import { NAV_ITEMS } from '@config/navigation';
import { usePermissions } from '@hooks/usePermissions';
import { useUIStore } from '@store/uiStore';
import Drawer from '@components/ui/Drawer';
import { cn } from '@utils/cn';

export default function MobileSidebar() {
  const { can } = usePermissions();
  const { mobileNavOpen, closeMobileNav } = useUIStore();
  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <Drawer isOpen={mobileNavOpen} onClose={closeMobileNav} side="left">
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-border-subtle">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
          <HiOutlineBoltSlash className="h-5 w-5 text-slate-950" />
        </span>
        <span className="text-base font-semibold text-ink tracking-tight">Voltura</span>
      </div>
      <nav className="px-3 py-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={closeMobileNav}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-surface-subtle text-ink' : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
                )
              }
            >
              <Icon className="h-[19px] w-[19px] shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </Drawer>
  );
}
