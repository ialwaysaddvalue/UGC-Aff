'use client'
import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatNumber, PLATFORM_CONFIG } from '@/lib/utils'
import { AnalyticsMetric, PlatformAnalytics } from '@/types'
import { seedAnalyticsData } from '@/store/useAppStore'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  DollarSign, MousePointerClick, Eye, TrendingUp,
  ArrowUpRight, Star, Target, Zap, BarChart2,
} from 'lucide-react'

const PLATFORM_COLORS = {
  tiktok: '#EE1D52',
  instagram: '#E1306C',
  youtube: '#FF0000',
  facebook: '#1877F2',
  snapchat: '#FFFC00',
}

interface AnalyticsData {
  metrics: AnalyticsMetric[]
  platforms: PlatformAnalytics[]
  totals: { clicks: number; views: number; conversions: number; earnings: number }
  summary: { avgCtr: string; avgConversionRate: string; revenuePerClick: string; bestDay: string }
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl px-4 py-3 shadow-card">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-100">
            {p.name === 'earnings' ? formatCurrency(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d')

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <PageShell title="Analytics" subtitle="Performance tracking">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-bg-border border-t-brand-500" />
        </div>
      </PageShell>
    )
  }

  const totals = data?.totals || { clicks: 0, views: 0, conversions: 0, earnings: 0 }
  const summary = data?.summary || { avgCtr: '0', avgConversionRate: '0', revenuePerClick: '0', bestDay: '-' }

  return (
    <PageShell
      title="Analytics"
      subtitle="Track performance and find your winning content"
      actions={
        <div className="flex items-center gap-2">
          {(['7d', '30d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-600/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Earnings', value: formatCurrency(totals.earnings), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/15', change: '+18.2%' },
          { label: 'Total Clicks', value: formatNumber(totals.clicks), icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/15', change: '+24.1%' },
          { label: 'Total Views', value: formatNumber(totals.views), icon: Eye, color: 'text-brand-400', bg: 'bg-brand-600/15', change: '+31.8%' },
          { label: 'Conversions', value: formatNumber(totals.conversions), icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/15', change: '+15.6%' },
        ].map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />{change} vs last period
                </p>
              </div>
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Click-Through Rate', value: `${summary.avgCtr}%`, icon: TrendingUp },
          { label: 'Conversion Rate', value: `${summary.avgConversionRate}%`, icon: Target },
          { label: 'Revenue Per Click', value: formatCurrency(parseFloat(summary.revenuePerClick)), icon: DollarSign },
          { label: 'Best Day', value: summary.bestDay || '—', icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 bg-bg-card border border-bg-border rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-3.5 w-3.5 text-brand-400" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-lg font-bold text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Earnings + Clicks Chart */}
        <div className="xl:col-span-2 card-base">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Revenue & Clicks Over Time</h3>
            <Badge variant="brand">7 days</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={seedAnalyticsData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earnings" name="earnings" stroke="#10B981" strokeWidth={2} fill="url(#earningsGrad)" />
              <Area type="monotone" dataKey="clicks" name="clicks" stroke="#3B82F6" strokeWidth={2} fill="url(#clicksGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Views Bar Chart */}
        <div className="card-base">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">Daily Views</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={seedAnalyticsData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" name="views" radius={[4, 4, 0, 0]}>
                {seedAnalyticsData.map((_, i) => (
                  <Cell key={i} fill={i === seedAnalyticsData.length - 1 ? '#7C3AED' : '#3B82F680'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">Platform Breakdown</h3>
          <p className="text-xs text-slate-500">Performance by platform</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Platform</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Views</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Clicks</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CTR</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Earnings</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Video</th>
              </tr>
            </thead>
            <tbody>
              {(data?.platforms || []).map((row) => {
                const cfg = PLATFORM_CONFIG[row.platform]
                return (
                  <tr key={row.platform} className="border-b border-bg-border/50 hover:bg-bg-surface/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-slate-300">{formatNumber(row.views)}</td>
                    <td className="py-3 px-3 text-right text-sm text-slate-300">{formatNumber(row.clicks)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-medium text-blue-400">{row.ctr}%</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-bold text-emerald-400">{formatCurrency(row.earnings)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-400">{row.topVideo}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Iteration Tips */}
      <div className="mt-6 p-5 bg-bg-card border border-bg-border rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">How to Iterate (Step 6)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Find your top 3 hooks by click-through rate and make 10 more videos using those patterns',
            'If retention drops below 50% at 3s, your hook is failing — replace it',
            'Double down on the platform driving the most revenue per click',
            'Kill underperforming content styles after 2 weeks of data — iterate fast',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <BarChart2 className="h-3.5 w-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
