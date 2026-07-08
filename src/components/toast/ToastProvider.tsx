import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ToastContext, type ToastContextValue, type ToastOptions, type ToastVariant } from './toast-context'

interface ToastItem extends ToastOptions {
  id: string
  variant: ToastVariant
  durationMs: number
}

const DEFAULT_DURATION_MS = 3200

const TOAST_STYLES: Record<ToastVariant, { accent: string; icon: string; title: string }> = {
  success: {
    accent: 'border-green-500/40 bg-green-500/10 text-green-400',
    icon: '✓',
    title: 'Success',
  },
  error: {
    accent: 'border-[var(--gh-danger)]/40 bg-[var(--gh-danger)]/10 text-[var(--gh-danger)]',
    icon: '!',
    title: 'Error',
  },
  info: {
    accent: 'border-[var(--gh-accent)]/40 bg-[var(--gh-accent)]/10 text-[var(--gh-accent)]',
    icon: 'i',
    title: 'Info',
  },
  warning: {
    accent: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    icon: '!',
    title: 'Warning',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    const timeoutId = timersRef.current.get(id)
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
      timersRef.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID()
    const toast: ToastItem = {
      id,
      variant: options.variant ?? 'info',
      durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
      title: options.title,
      description: options.description,
    }

    setToasts((current) => [...current, toast])

    if (toast.durationMs > 0) {
      const timeoutId = window.setTimeout(() => dismiss(id), toast.durationMs)
      timersRef.current.set(id, timeoutId)
    }

    return id
  }, [dismiss])

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      for (const timeoutId of timers.values()) {
        window.clearTimeout(timeoutId)
      }
      timers.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(() => ({
    show,
    success: (description, options) => show({ ...options, description, variant: 'success' }),
    error: (description, options) => show({ ...options, description, variant: 'error' }),
    info: (description, options) => show({ ...options, description, variant: 'info' }),
    warning: (description, options) => show({ ...options, description, variant: 'warning' }),
    dismiss,
  }), [dismiss, show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.variant]

          return (
            <div
              key={toast.id}
              role={toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status'}
              className={`pointer-events-auto rounded-lg border px-3 py-3 shadow-lg backdrop-blur-sm ${style.accent}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/30 text-xs font-bold">
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title ?? style.title}</p>
                  <p className="mt-0.5 text-sm break-words text-[var(--gh-text-primary)] dark:text-white/90">{toast.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="shrink-0 rounded border border-current/20 px-1.5 py-0.5 text-xs hover:opacity-80"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
