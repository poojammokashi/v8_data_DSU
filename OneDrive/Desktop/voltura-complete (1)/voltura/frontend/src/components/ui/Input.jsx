import { forwardRef, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { cn } from '@utils/cn';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      type = 'text',
      className,
      containerClassName,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name;
    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink mb-1.5"
          >
            {label}
            {required && <span className="text-danger-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <LeftIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full h-10 rounded-xl border bg-surface-raised px-3.5 text-sm text-ink placeholder:text-ink-faint',
              'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400',
              LeftIcon && 'pl-9.5',
              isPassword && 'pr-10',
              error ? 'border-danger-500' : 'border-border hover:border-ink-faint',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <HiOutlineEyeSlash className="h-4 w-4" />
              ) : (
                <HiOutlineEye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
