'use client';

import clsx from 'clsx';
import { type HTMLAttributes } from 'react';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label */
  label?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-9 h-9 border-[3px]',
  lg: 'w-14 h-14 border-4',
};

/**
 * Animated spinner with yellow brand accent.
 * Accessible via role="status" + aria-label.
 */
export default function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  className,
  ...rest
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={clsx('flex items-center justify-center', className)}
      {...rest}
    >
      <div
        className={clsx(
          'rounded-full border-transparent animate-spin',
          sizeMap[size],
        )}
        style={{
          borderTopColor: 'var(--color-brand-yellow)',
          borderRightColor: 'rgba(212, 240, 0, 0.3)',
          borderBottomColor: 'transparent',
          borderLeftColor: 'rgba(212, 240, 0, 0.1)',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
