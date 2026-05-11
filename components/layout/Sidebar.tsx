'use client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Video,
  Target,
  Send,
  BarChart3,
  Settings,
  Zap,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/research', label: 'Research', icon: TrendingUp },
  { href: '/scripts', label: 'Scripts', icon: FileText },
  { href: '/videos', label: 'Videos', icon: Video },
  { href: '/campaigns', label: 'Campaigns', icon: Target },
  { href: '/publish', label: 'Publisher', icon: Send },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bg-surface border-r border-bg-border flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-bg-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow-brand">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100">UGC-Aff</p>
          <p className="text-[10px] text-slate-500">AI Content Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
        <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Platform
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-bg-hover'
                  )}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-brand-400' : 'text-slate-500')} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-bg-border">
          <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Integrations
          </p>
          <div className="space-y-1">
            {[
              { name: 'HeyGen', color: 'bg-violet-500', status: 'Connected' },
              { name: 'Higgsfield', color: 'bg-blue-500', status: 'Connected' },
              { name: 'OpenAI', color: 'bg-emerald-500', status: 'Connected' },
              { name: 'Claude', color: 'bg-amber-500', status: 'Connected' },
            ].map(({ name, color, status }) => (
              <div key={name} className="flex items-center gap-2.5 px-3 py-2">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
                <span className="text-xs text-slate-400 flex-1">{name}</span>
                <span className="text-[10px] text-emerald-500">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom CTA */}
      <div className="p-3 border-t border-bg-border">
        <a
          href="https://glitchy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-brand-600/10 border border-brand-600/20 rounded-xl text-xs font-medium text-brand-300 hover:bg-brand-600/20 transition-colors"
        >
          <Target className="h-3.5 w-3.5" />
          <span className="flex-1">Glitchy Offers</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </aside>
  )
}
