import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional Tailwind classes safely, resolving conflicting utilities.
 * Usage: cn('px-2 py-1', isActive && 'bg-amber-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
