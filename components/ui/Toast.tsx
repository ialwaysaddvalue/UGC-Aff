'use client'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), 4500)
  },
  remove: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))

export function toast(type: ToastType, title: string, message?: string) {
  useToastStore.getState().add({ type, title, message })
}

const toastIcons = {
  success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
}

const toastStyles = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border bg-bg-card shadow-card-hover min-w-[280px] max-w-[380px] animate-in slide-in-from-right-5',
            toastStyles[t.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{toastIcons[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100">{t.title}</p>
            {t.message && <p className="text-xs text-slate-400 mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => remove(t.id)}
            className="flex-shrink-0 p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
