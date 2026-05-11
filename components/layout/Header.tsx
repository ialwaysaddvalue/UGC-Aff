'use client'
import { cn } from '@/lib/utils'
import { Bell, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-bg-base/80 backdrop-blur-md border-b border-bg-border">
      <div>
        <h1 className="text-lg font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-bg-hover transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>

        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-bg-hover transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-bg-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">Creator</p>
            <p className="text-[10px] text-slate-500">Pro Plan</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      <Header title={title} subtitle={subtitle} actions={actions} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
