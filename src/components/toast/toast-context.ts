import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title?: string
  description: string
  variant?: ToastVariant
  durationMs?: number
}

export interface ToastContextValue {
  show: (options: ToastOptions) => string
  success: (description: string, options?: Omit<ToastOptions, 'description' | 'variant'>) => string
  error: (description: string, options?: Omit<ToastOptions, 'description' | 'variant'>) => string
  info: (description: string, options?: Omit<ToastOptions, 'description' | 'variant'>) => string
  warning: (description: string, options?: Omit<ToastOptions, 'description' | 'variant'>) => string
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
