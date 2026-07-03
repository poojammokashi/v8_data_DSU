import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_GROUPS, getSheetsByGroup } from '../../config/sheetsConfig.js';
import { useLoading } from '../../context/LoadingContext.jsx';

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { startLoading } = useLoading();

  const handleNavClick = () => {
    startLoading('Loading module');
    onCloseMobile?.();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 flex h-screen flex-col border-r border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark transition-all duration-200
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64`}
      >
        <div className={`flex h-16 shrink-0 items-center gap-2 border-b border-border-light dark:border-border-dark px-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
            DSU
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-tight lg:flex">
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">Decision Support</span>
              <span className="text-[11px] text-muted-light dark:text-muted-dark">Unit · KPTCL</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <NavLink
            to="/"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              `mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5'
              } ${collapsed ? 'lg:justify-center' : ''}`
            }
          >
            <Icons.LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Dashboard Home</span>}
          </NavLink>

          {NAV_GROUPS.filter((g) => g.id !== 'overview').map((group) => {
            const sheets = getSheetsByGroup(group.id);
            if (sheets.length === 0) return null;
            return (
              <div key={group.id} className="mb-4">
                {!collapsed && (
                  <p className="label-eyebrow px-3 pb-1.5">{group.label}</p>
                )}
                <div className="flex flex-col gap-0.5">
                  {sheets.map((sheet) => {
                    const Icon = Icons[sheet.icon] || Icons.Circle;
                    return (
                      <NavLink
                        key={sheet.key}
                        to={`/module/${sheet.route}`}
                        onClick={handleNavClick}
                        title={collapsed ? sheet.title : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                              : 'text-ink-light dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5'
                          } ${collapsed ? 'lg:justify-center' : ''}`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{sheet.title}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border-light dark:border-border-dark p-2">
          <button
            type="button"
            onClick={onToggle}
            className={`hidden lg:flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-light dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
          >
            <Icons.PanelLeftClose className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
