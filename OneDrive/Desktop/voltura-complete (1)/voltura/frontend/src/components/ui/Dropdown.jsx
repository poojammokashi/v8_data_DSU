import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@hooks/useClickOutside';
import { cn } from '@utils/cn';

export default function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-30 mt-2 min-w-[200px] rounded-xl border border-border-subtle bg-surface-overlay shadow-raised py-1.5',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, className, danger, ...props }) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
        danger ? 'text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10' : 'text-ink hover:bg-surface-subtle',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1.5 border-t border-border-subtle" />;
}
