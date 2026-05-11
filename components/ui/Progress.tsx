import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function Progress({ value, max = 100, className, barClassName, showLabel, size = 'md' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs text-slate-300 font-medium">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-bg-border rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClassName || 'bg-gradient-brand')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
