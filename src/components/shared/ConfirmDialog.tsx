import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  variant?: 'danger' | 'warning' | 'default'
}

const confirmBtnMap: Record<string, string> = {
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  warning: 'bg-amber-600 text-white hover:bg-amber-700',
  default: 'bg-slate-800 text-white hover:bg-slate-900',
}

const iconColorMap: Record<string, string> = {
  danger: 'text-rose-600',
  warning: 'text-amber-600',
  default: 'text-slate-600',
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  variant = 'default',
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-scaleIn">
        <div className="flex items-start gap-4">
          <AlertTriangle className={cn('h-6 w-6 shrink-0 mt-0.5', iconColorMap[variant])} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              confirmBtnMap[variant],
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
