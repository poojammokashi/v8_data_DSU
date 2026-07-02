import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

export default function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-surface-subtle p-1 border border-border-subtle',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150',
              isActive ? 'text-slate-950' : 'text-ink-muted hover:text-ink'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tabs-active-pill"
                className="absolute inset-0 bg-amber-500 rounded-lg shadow-soft"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
