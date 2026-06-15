import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'warning' | 'danger'
}

const variantMap: Record<string, string> = {
  default: 'border-slate-200 bg-white',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-rose-200 bg-rose-50',
}

const iconBgMap: Record<string, string> = {
  default: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-rose-100 text-rose-600',
}

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColorMap: Record<string, string> = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  neutral: 'text-slate-500',
}

export default function StatCard({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  variant = 'default',
}: StatCardProps) {
  const TrendIcon = trendIconMap[trend]

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        variantMap[variant],
      )}
    >
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBgMap[variant])}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
        <p className="text-sm text-slate-500">{title}</p>
      </div>
      {trendValue && (
        <div className={cn('flex items-center gap-1 text-sm font-medium', trendColorMap[trend])}>
          <TrendIcon className="h-4 w-4" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}
