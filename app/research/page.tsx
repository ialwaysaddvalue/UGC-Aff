'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { formatNumber, NICHE_OPTIONS, PLATFORM_CONFIG } from '@/lib/utils'
import { TrendResult, Platform } from '@/types'
import {
  TrendingUp, Search, Sparkles, Zap, Eye, MousePointerClick,
  Copy, ChevronRight, BarChart2, Lightbulb, Hash, FileText,
} from 'lucide-react'
import Link from 'next/link'

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'snapchat'] as Platform[]

export default function ResearchPage() {
  const { settings } = useAppStore()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ trends: TrendResult[]; hooks: string[]; patterns: string[] } | null>(null)

  async function handleResearch() {
    if (!niche) {
      toast('warning', 'Select a niche', 'Choose a niche before researching')
      return
    }
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          platform,
          provider: settings.defaultAiProvider,
          apiKey: settings.defaultAiProvider === 'claude' ? settings.anthropicApiKey : settings.openaiApiKey,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Research failed')
      }
      const data = await res.json()
      setResults(data)
      toast('success', 'Research complete', `Found ${data.trends.length} viral patterns`)
    } catch (err) {
      toast('error', 'Research failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast('success', 'Copied!', 'Text copied to clipboard')
  }

  return (
    <PageShell
      title="Research"
      subtitle="Discover viral content patterns before creating"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
            Claude + OpenAI
          </Badge>
        </div>
      }
    >
      {/* Research Form */}
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-100">Trend Research</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Most beginners choose an offer first and hope the content works later. Do the opposite — find what&apos;s
          already working, then match your Glitchy offer to that content style.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Niche"
            value={niche}
            onChange={setNiche}
            placeholder="Select a niche..."
            options={NICHE_OPTIONS.map(n => ({ value: n, label: n }))}
          />
          <Select
            label="Platform"
            value={platform}
            onChange={(v) => setPlatform(v as Platform)}
            options={PLATFORMS.map(p => ({ value: p, label: PLATFORM_CONFIG[p].label }))}
          />
          <div className="flex items-end">
            <Button
              variant="primary"
              className="w-full"
              loading={loading}
              onClick={handleResearch}
              icon={<TrendingUp className="h-4 w-4" />}
            >
              {loading ? 'Researching...' : 'Research Trends'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Patterns */}
          <div className="card-base">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">Viral Patterns in {niche}</h3>
              <Badge variant="warning">What&apos;s working</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.patterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-bg-surface border border-bg-border rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-500 mt-0.5">#{i + 1}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{pattern}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hook Templates */}
          <div className="card-base">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100">Hook Templates</h3>
              <Badge variant="brand">Copy & test</Badge>
            </div>
            <div className="space-y-2">
              {results.hooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface border border-bg-border rounded-xl group hover:border-brand-600/30 transition-colors">
                  <div className="w-5 h-5 bg-brand-600/20 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-300 flex-1 leading-relaxed">&quot;{hook}&quot;</p>
                  <button
                    onClick={() => copyToClipboard(hook)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-bg-hover transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Content Angles */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-100">Content Angles</h3>
              <p className="text-xs text-slate-500">with viral potential scores</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.trends.map((trend) => (
                <TrendCard key={trend.id} trend={trend} onCopyHook={() => copyToClipboard(trend.hook)} />
              ))}
            </div>
          </div>

          {/* CTA to Script */}
          <div className="p-5 bg-gradient-brand-subtle border border-brand-600/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">Found your winning angle?</p>
                <p className="text-xs text-slate-400 mt-1">Take one of these hooks and turn it into a full script with AI</p>
              </div>
              <Link href="/scripts">
                <Button variant="primary" iconRight={<ChevronRight className="h-4 w-4" />}>
                  Write Script
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {[
            { icon: Eye, title: 'Study what works', desc: 'Pay attention to hooks, captions, pacing and angles on viral videos' },
            { icon: Hash, title: 'Find patterns', desc: 'Identify the commonalities between videos getting 1M+ views' },
            { icon: FileText, title: 'Match to offers', desc: 'Choose a Glitchy offer that naturally fits the content style' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-base text-center">
              <div className="w-10 h-10 bg-brand-600/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function TrendCard({ trend, onCopyHook }: { trend: TrendResult; onCopyHook: () => void }) {
  const cfg = PLATFORM_CONFIG[trend.platform as Platform]
  return (
    <Card className="hover:border-brand-600/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-semibold text-slate-100 leading-snug">{trend.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Viral Score</span>
            <span className="text-sm font-bold text-emerald-400">{trend.viralScore}</span>
          </div>
          <Badge variant="outline" className={cfg.color}>
            {cfg.label}
          </Badge>
        </div>
      </div>

      <Progress value={trend.viralScore} barClassName="bg-gradient-to-r from-emerald-500 to-blue-500" size="sm" className="mb-3" />

      <div className="p-2.5 bg-bg-surface rounded-lg mb-3 group relative">
        <p className="text-xs text-slate-300 italic leading-relaxed">&quot;{trend.hook}&quot;</p>
        <button
          onClick={onCopyHook}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-100 transition-all"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(trend.views)}</span>
        <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{trend.engagement}% eng.</span>
        <div className="flex gap-1 ml-auto">
          {trend.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-bg-border rounded text-[10px]">#{tag}</span>
          ))}
        </div>
      </div>
    </Card>
  )
}
