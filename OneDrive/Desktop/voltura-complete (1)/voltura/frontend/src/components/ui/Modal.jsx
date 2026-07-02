import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';
import { cn } from '@utils/cn';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, size = 'md', children, className }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();

    function getFocusableElements() {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      // Trap Tab/Shift+Tab within the dialog so keyboard focus never
      // escapes to the page behind it while the modal is open (WCAG 2.4.3).
      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'relative w-full rounded-2xl bg-surface-overlay border border-border-subtle shadow-raised',
              'max-h-[85vh] overflow-y-auto',
              SIZES[size],
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

function ModalHeader({ children, onClose, className }) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-border-subtle', className)}>
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="text-ink-faint hover:text-ink hover:bg-surface-subtle rounded-lg p-1.5 transition-colors"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function ModalBody({ children, className }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return (
    <div className={cn('flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle', className)}>
      {children}
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
