import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card-base',
        hover && 'hover:border-brand-600/30 hover:shadow-card cursor-pointer',
        glow && 'card-glow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-slate-100', className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-slate-400 mt-1', className)}>{children}</p>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-4 border-t border-bg-border', className)}>{children}</div>
}

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  gradient?: string
  className?: string
}

export function StatCard({ title, value, change, changeType = 'neutral', icon, gradient, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1 font-medium', {
              'text-emerald-400': changeType === 'up',
              'text-red-400': changeType === 'down',
              'text-slate-500': changeType === 'neutral',
            })}>
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', gradient || 'bg-brand-600/20')}>
          {icon}
        </div>
      </div>
    </div>
  )
}
