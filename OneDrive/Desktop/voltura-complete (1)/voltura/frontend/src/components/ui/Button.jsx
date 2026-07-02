import { forwardRef } from 'react';
import { HiOutlineArrowPath } from 'react-icons/hi2';
import { cn } from '@utils/cn';

const VARIANTS = {
  primary:
    'bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600 shadow-soft focus-visible:outline-amber-500',
  secondary:
    'bg-surface-raised text-ink border border-border hover:bg-surface-subtle active:bg-border-subtle',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-subtle hover:text-ink',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-soft',
  outline:
    'bg-transparent border border-border text-ink hover:border-ink-faint hover:bg-surface-subtle',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 w-10 p-0 justify-center',
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center font-medium rounded-xl transition-all duration-150 ease-snappy',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98]',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
        ) : (
          LeftIcon && <LeftIcon className="h-4 w-4 shrink-0" />
        )}
        {children}
        {!isLoading && RightIcon && <RightIcon className="h-4 w-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
