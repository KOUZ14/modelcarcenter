'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { useToastStore } from '@/store/toast-store';

const variantStyles: Record<string, string> = {
  success: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100',
  error: 'border-rose-400/70 bg-rose-500/15 text-rose-100',
  warning: 'border-amber-400/70 bg-amber-500/20 text-amber-50',
  info: 'border-brand-400/70 bg-brand-500/20 text-slate-100',
};

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore((state) => ({
    toasts: state.toasts,
    dismiss: state.dismiss,
  }));

  useEffect(() => {
    const timers = toasts.map((toast) => {
      const duration = toast.duration ?? 4000;
      return window.setTimeout(() => dismiss(toast.id), duration);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clsx(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg',
            variantStyles[toast.variant ?? 'info']
          )}
        >
          <div>
            <p className="text-sm font-semibold leading-tight">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-xs opacity-80">{toast.description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="ml-auto text-xs uppercase tracking-wide text-slate-200/70 transition hover:text-white"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
