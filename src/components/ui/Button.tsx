'use client';

import clsx from 'clsx';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)]',
    'font-bold tracking-wide',
    'hover:bg-[var(--color-brand-yellow-dark)]',
    'btn-glow',
    'border border-[var(--color-brand-yellow)]',
  ].join(' '),
  secondary: [
    'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]',
    'border border-[var(--color-glass-border)]',
    'hover:border-[var(--color-brand-yellow)] hover:text-[var(--color-brand-yellow)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-primary)]',
    'hover:bg-[var(--color-glass)] hover:text-[var(--color-brand-yellow)]',
  ].join(' '),
  outline: [
    'bg-transparent',
    'border border-[var(--color-brand-yellow)] text-[var(--color-brand-yellow)]',
    'hover:bg-[var(--color-brand-yellow)] hover:text-[var(--color-brand-black)]',
    'btn-glow',
  ].join(' '),
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
};

/**
 * Polymorphic button with brand variants.
 * Forwards ref for accessibility and animation compatibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-black)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:btn-glow-none',
        'select-none cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <span
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
