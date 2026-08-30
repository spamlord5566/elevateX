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
import styles from './Toast.module.css';

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
  success: <CheckCircle size={20} color="var(--color-brand-yellow)" />,
  error: <XCircle size={20} color="#f87171" />,
  info: <Info size={20} color="#60a5fa" />,
  warning: <AlertTriangle size={20} color="#fbbf24" />,
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
      className={clsx(styles.toast, styles[item.variant])}
    >
      <span className={styles.icon}>{iconMap[item.variant]}</span>
      <p className={styles.message}>
        {item.message}
      </p>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Dismiss notification"
        className={styles.dismiss}
      >
        <X size={16} />
      </button>
      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div
          ref={progressRef}
          className={clsx(styles.progress, styles[`progress${item.variant[0].toUpperCase()}${item.variant.slice(1)}`])}
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
        className={styles.stack}
      >
        {toasts.map((t) => (
          <div key={t.id} className={styles.entry}>
            <Toast item={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
