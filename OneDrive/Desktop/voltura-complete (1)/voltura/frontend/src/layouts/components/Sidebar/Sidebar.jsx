import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBoltSlash, HiOutlineChevronDoubleLeft } from 'react-icons/hi2';
import { NAV_ITEMS } from '@config/navigation';
import { usePermissions } from '@hooks/usePermissions';
import { useUIStore } from '@store/uiStore';
import { cn } from '@utils/cn';
import Tooltip from '@components/ui/Tooltip';

export default function Sidebar() {
  const { can } = usePermissions();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-surface-subtle border-r border-border-subtle transition-all duration-200 ease-snappy',
        sidebarCollapsed ? 'w-[76px]' : 'w-[248px]'
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center h-16 shrink-0', sidebarCollapsed ? 'justify-center px-0' : 'px-5 gap-2.5')}>
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 shrink-0">
          <HiOutlineBoltSlash className="h-5 w-5 text-slate-950" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-surface-subtle animate-pulseGlow" />
        </span>
        {!sidebarCollapsed && (
          <span className="text-base font-semibold text-ink tracking-tight">Voltura</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const linkContent = (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                  sidebarCollapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-surface-raised text-ink shadow-soft'
                    : 'text-ink-muted hover:bg-surface-raised/60 hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-amber-500"
                      transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
                    />
                  )}
                  <Icon className={cn('h-[19px] w-[19px] shrink-0', isActive && 'text-amber-500')} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );

          return sidebarCollapsed ? (
            <Tooltip key={item.id} content={item.label} position="right">
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border-subtle">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-surface-raised/60 hover:text-ink transition-colors',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <HiOutlineChevronDoubleLeft
            className={cn('h-[18px] w-[18px] transition-transform duration-200', sidebarCollapsed && 'rotate-180')}
          />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
