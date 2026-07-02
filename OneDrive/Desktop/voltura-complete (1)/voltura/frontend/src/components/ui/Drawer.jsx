import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@utils/cn';

export default function Drawer({ isOpen, onClose, side = 'left', children, className }) {
  const slideFrom = side === 'left' ? '-100%' : '100%';
  const positionClass = side === 'left' ? 'left-0' : 'right-0';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'absolute top-0 bottom-0 w-[280px] bg-surface-raised border-border-subtle shadow-raised',
              side === 'left' ? 'border-r' : 'border-l',
              positionClass,
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
