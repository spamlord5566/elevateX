'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Icons map ────────────────────────────────────────────

const iconMap: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-[var(--color-brand-yellow)]" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
};

const borderMap: Record<ToastVariant, string> = {
  success: 'border-[var(--color-brand-yellow)]/40',
  error: 'border-red-500/40',
  info: 'border-blue-500/40',
  warning: 'border-amber-500/40',
};

// ─── Single Toast ─────────────────────────────────────────

function Toast({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = item.duration ?? 4000;
    const timer = setTimeout(() => onRemove(item.id), duration);

    // Animate progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        if (progressRef.current) progressRef.current.style.width = '0%';
      });
    }

    return () => clearTimeout(timer);
  }, [item, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={clsx(
        'relative flex items-start gap-3 overflow-hidden',
        'glass-card border px-4 py-3.5 min-w-[300px] max-w-[420px]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        borderMap[item.variant],
      )}
    >
      <span className="mt-0.5 shrink-0">{iconMap[item.variant]}</span>
      <p className="text-sm text-[var(--color-text-primary)] flex-1 leading-snug">
        {item.message}
      </p>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-surface-3)]">
        <div
          ref={progressRef}
          className={clsx(
            'h-full w-full origin-left',
            item.variant === 'success' && 'bg-[var(--color-brand-yellow)]',
            item.variant === 'error' && 'bg-red-400',
            item.variant === 'info' && 'bg-blue-400',
            item.variant === 'warning' && 'bg-amber-400',
          )}
        />
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Stack — bottom-right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300">
            <Toast item={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
