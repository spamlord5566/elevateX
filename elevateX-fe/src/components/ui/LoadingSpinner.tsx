'use client';

import clsx from 'clsx';
import { type HTMLAttributes } from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label */
  label?: string;
}

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
      className={clsx(styles.container, className)}
      {...rest}
    >
      <div
        className={clsx(styles.spinner, styles[size])}
      />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
