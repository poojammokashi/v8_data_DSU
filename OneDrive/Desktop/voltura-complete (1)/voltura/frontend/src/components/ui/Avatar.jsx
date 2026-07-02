import { useState } from 'react';
import { cn } from '@utils/cn';
import { getInitials } from '@utils/formatters';

const SIZES = {
  sm: 'h-7 w-7 text-2xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-lg',
};

export default function Avatar({ src, name = '', size = 'md', className }) {
  const [errored, setErrored] = useState(false);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className={cn('rounded-full object-cover border border-border-subtle', SIZES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-slate-950 bg-gradient-to-br from-amber-300 to-amber-500',
        SIZES[size],
        className
      )}
    >
      {getInitials(name) || '?'}
    </div>
  );
}
