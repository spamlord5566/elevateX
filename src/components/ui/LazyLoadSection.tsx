'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyLoadSectionProps {
  /** Content to lazily mount when in view */
  children: ReactNode;
  /** Fraction of element that must be visible before mounting (0–1) */
  threshold?: number;
  /** Margin around the root for early trigger */
  rootMargin?: string;
  /** CSS class applied to the wrapper div */
  className?: string;
  /** Placeholder height while not yet visible — avoids layout shift */
  placeholderHeight?: string;
}

/**
 * Defers mounting children until the section scrolls into the viewport.
 * Uses IntersectionObserver internally — no third-party deps.
 *
 * Once mounted, children stay mounted even if scrolled out of view
 * (prevents re-fetching data or re-running animations unnecessarily).
 *
 * Respects prefers-reduced-motion by accepting threshold override externally.
 */
export default function LazyLoadSection({
  children,
  threshold = 0.05,
  rootMargin = '0px 0px -80px 0px',
  className = '',
  placeholderHeight = '200px',
}: LazyLoadSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMounted(true);
          observer.disconnect(); // Once mounted, never unmount
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isMounted ? (
        children
      ) : (
        <div style={{ minHeight: placeholderHeight }} aria-hidden="true" />
      )}
    </div>
  );
}
