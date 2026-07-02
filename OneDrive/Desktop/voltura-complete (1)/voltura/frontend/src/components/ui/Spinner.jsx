import { cn } from '@utils/cn';

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-amber-500 border-t-transparent animate-spin',
        SIZES[size],
        className
      )}
    />
  );
}
