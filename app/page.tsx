'use client'
import { PageShell } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatNumber, formatRelativeTime, PLATFORM_CONFIG } from '@/lib/utils'
import {
  DollarSign, MousePointerClick, Eye, Video, FileText,
  Target, ArrowRight, TrendingUp, Zap, Play, Clock,
  ChevronRight, BarChart2, Plus
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { seedAnalyticsData } from '@/store/useAppStore'

const quickActions = [
  { href: '/research', icon: TrendingUp, label: 'Research Trends', desc: 'Find viral content patterns', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { href: '/scripts', icon: FileText, label: 'Write Script', desc: 'AI-powered script generator', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { href: '/videos', icon: Video, label: 'Create Video', desc: 'HeyGen & Higgsfield', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { href: '/publish', icon: Zap, label: 'Publish Content', desc: 'Post to 5 platforms', color: 'text-amber-400', bg: 'bg-amber-400/10' },
]

const systemSteps = [
  { step: 1, title: 'Research', desc: 'Find viral patterns in your niche', href: '/research', done: false },
  { step: 2, title: 'Script', desc: 'AI writes your hook + CTA', href: '/scripts', done: false },
  { step: 3, title: 'Create', desc: 'Generate UGC video with AI avatar', href: '/videos', done: false },
  { step: 4, title: 'Review', desc: 'Would you stop scrolling?', href: '/videos', done: false },
  { step: 5, title: 'Publish', desc: 'Post to TikTok, Reels, Shorts+', href: '/publish', done: false },
  { step: 6, title: 'Iterate', desc: 'Double down on winners', href: '/analytics', done: false },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs text-slate-300 capitalize">{p.name}:</span>
          <span className="text-xs font-semibold text-slate-100">
            {p.name === 'earnings' ? formatCurrency(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { scripts, videos, campaigns } = useAppStore()

  const totalClicks = campaigns.reduce((s, c) => s + c.totalClicks, 0)
  const totalEarnings = campaigns.reduce((s, c) => s + c.totalEarnings, 0)
  const totalViews = seedAnalyticsData.reduce((s, d) => s + d.views, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  return (
    <PageShell
      title="Dashboard"
      subtitle="Your AI content monetization command center"
      actions={
        <Link href="/scripts">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>New Script</Button>
        </Link>
      }
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          change="vs last week"
          changeType="up"
          icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
          gradient="bg-emerald-500/15"
        />
        <StatCard
          title="Total Clicks"
          value={formatNumber(totalClicks)}
          change="+12.4%"
          changeType="up"
          icon={<MousePointerClick className="h-5 w-5 text-blue-400" />}
          gradient="bg-blue-500/15"
        />
        <StatCard
          title="Total Views"
          value={formatNumber(totalViews)}
          change="+24.1%"
          changeType="up"
          icon={<Eye className="h-5 w-5 text-brand-400" />}
          gradient="bg-brand-600/15"
        />
        <StatCard
          title="Active Campaigns"
          value={activeCampaigns.toString()}
          change={`${scripts.length} scripts ready`}
          changeType="neutral"
          icon={<Target className="h-5 w-5 text-amber-400" />}
          gradient="bg-amber-500/15"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="xl:col-span-2 card-base">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Performance (7 Days)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Clicks, views & earnings</p>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" iconRight={<ChevronRight className="h-3.5 w-3.5" />}>
                Full Analytics
              </Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={seedAnalyticsData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earnings" stroke="#7C3AED" strokeWidth={2} fill="url(#earnGrad)" name="earnings" />
              <Area type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={2} fill="url(#clickGrad)" name="clicks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaigns */}
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Active Campaigns</h3>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {campaigns.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-bg-surface rounded-xl border border-bg-border hover:border-bg-hover transition-colors">
                <div className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="h-3.5 w-3.5 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">{formatNumber(c.totalClicks)} clicks</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-emerald-400">{formatCurrency(c.totalEarnings)}</p>
                  <Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="py-8 text-center">
                <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No campaigns yet</p>
                <Link href="/campaigns">
                  <Button variant="ghost" size="sm" className="mt-2">Create Campaign</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card-base">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map(({ href, icon: Icon, label, desc, color, bg }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-surface transition-colors group cursor-pointer">
                  <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 6-Step System */}
        <div className="xl:col-span-2 card-base">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">The 6-Step System</h3>
              <p className="text-xs text-slate-500 mt-0.5">Research → Script → Create → Review → Publish → Iterate</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {systemSteps.map(({ step, title, desc, href }) => (
              <Link key={step} href={href}>
                <div className="p-4 bg-bg-surface border border-bg-border rounded-xl hover:border-brand-600/30 hover:bg-bg-hover transition-all group cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{step}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">Recent Activity</h3>
          <Badge variant="brand">{scripts.length + videos.length} items</Badge>
        </div>
        {scripts.length === 0 && videos.length === 0 ? (
          <div className="py-8 text-center">
            <BarChart2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No activity yet</p>
            <p className="text-xs text-slate-600 mt-1">Start by researching trends or writing your first script</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link href="/research"><Button variant="secondary" size="sm" icon={<TrendingUp className="h-3.5 w-3.5" />}>Research Trends</Button></Link>
              <Link href="/scripts"><Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>New Script</Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...scripts.slice(0, 3).map(s => ({ type: 'script' as const, item: s })),
               ...videos.slice(0, 3).map(v => ({ type: 'video' as const, item: v }))]
              .sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime())
              .slice(0, 5)
              .map(({ type, item }) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-surface transition-colors">
                  <div className={`p-2 rounded-lg ${type === 'script' ? 'bg-violet-500/10' : 'bg-blue-500/10'} flex-shrink-0`}>
                    {type === 'script'
                      ? <FileText className="h-3.5 w-3.5 text-violet-400" />
                      : <Play className="h-3.5 w-3.5 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{'title' in item ? item.title : ''}</p>
                    <p className="text-xs text-slate-500">
                      {type === 'script' ? 'Script' : 'Video'} · {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant={type === 'script' ? 'brand' : 'info'}>{type}</Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Non-US Creator Tip */}
      <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/15 rounded-lg flex-shrink-0">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">Pro Tip: Target US Traffic</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              US traffic pays the most. Setup: residential proxy + fresh device + US SIM + US TikTok account.
              Configure once, earn long-term.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
