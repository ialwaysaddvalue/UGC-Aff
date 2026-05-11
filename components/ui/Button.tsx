'use client'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200',
  outline: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-200 border border-bg-border hover:border-brand-600/50 hover:bg-bg-hover transition-all duration-200',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: '!px-3 !py-1.5 !text-xs',
  md: '',
  lg: '!px-6 !py-3.5 !text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variantStyles[variant], sizeStyles[size], 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none', className)}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
        {iconRight && !loading && iconRight}
      </button>
    )
  }
)

Button.displayName = 'Button'
