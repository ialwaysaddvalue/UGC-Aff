'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatNumber, formatRelativeTime, NICHE_OPTIONS, PLATFORM_CONFIG } from '@/lib/utils'
import { Campaign, CampaignStatus, Platform } from '@/types'
import {
  Target, Plus, ExternalLink, Copy, Trash2, TrendingUp,
  DollarSign, MousePointerClick, Video, Pause, Play,
  BarChart2, Link as LinkIcon, ChevronRight, Zap,
} from 'lucide-react'
import Link from 'next/link'

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'snapchat'] as Platform[]

export default function CampaignsPage() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all')

  // Form state
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [offer, setOffer] = useState('')
  const [affiliateLink, setAffiliateLink] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'instagram', 'youtube'])

  function handleCreate() {
    if (!name || !niche || !offer || !affiliateLink) {
      toast('warning', 'Missing fields', 'All fields are required')
      return
    }
    addCampaign({
      name, niche, offer, affiliateLink,
      status: 'active',
      platforms: selectedPlatforms,
    })
    toast('success', 'Campaign created!', name)
    setShowCreate(false)
    setName(''); setNiche(''); setOffer(''); setAffiliateLink('')
  }

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter)
  const totalEarnings = campaigns.reduce((s, c) => s + c.totalEarnings, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.totalClicks, 0)
  const activeCount = campaigns.filter(c => c.status === 'active').length

  function togglePlatform(p: Platform) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  return (
    <PageShell
      title="Campaigns"
      subtitle="Manage your Glitchy affiliate campaigns"
      actions={
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
          New Campaign
        </Button>
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Earnings', value: formatCurrency(totalEarnings), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Total Clicks', value: formatNumber(totalClicks), icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/15' },
          { label: 'Active Campaigns', value: activeCount.toString(), icon: Target, color: 'text-brand-400', bg: 'bg-brand-600/15' },
          { label: 'Total Campaigns', value: campaigns.length.toString(), icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-100 mt-1">{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Glitchy Info Banner */}
      <div className="p-4 bg-brand-600/5 border border-brand-600/20 rounded-2xl mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-300">How Glitchy Works</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Glitchy is an affiliate platform where you earn money simply by sending clicks to your unique link.
                No inventory, no customer support, no shipping. Grab your link, drive traffic, get paid.
              </p>
            </div>
          </div>
          <a href="https://glitchy.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <Button variant="outline" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
              Get Links
            </Button>
          </a>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'active', 'paused', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-brand-600/20 text-brand-300 border border-brand-600/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${campaigns.length})`}
          </button>
        ))}
      </div>

      {/* Campaigns List */}
      {filtered.length === 0 ? (
        <div className="card-base text-center py-16">
          <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-brand-400" />
          </div>
          <p className="text-base font-semibold text-slate-200">No campaigns yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Create your first campaign with a Glitchy affiliate link
          </p>
          <Button variant="primary" className="mt-4" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={() => { deleteCampaign(campaign.id); toast('info', 'Campaign deleted') }}
              onToggleStatus={() =>
                updateCampaign(campaign.id, {
                  status: campaign.status === 'active' ? 'paused' : 'active',
                })
              }
              onCopyLink={() => {
                navigator.clipboard.writeText(campaign.affiliateLink)
                toast('success', 'Link copied!')
              }}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Campaign"
        description="Set up a new Glitchy affiliate campaign"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Glitchy — Make Money Online"
          />
          <Select
            label="Niche"
            value={niche}
            onChange={setNiche}
            placeholder="Select niche..."
            options={NICHE_OPTIONS.map(n => ({ value: n, label: n }))}
          />
          <Input
            label="Offer / Product Description"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            placeholder="e.g. Earn money by sending clicks to affiliate links"
          />
          <Input
            label="Affiliate Link (Glitchy)"
            value={affiliateLink}
            onChange={e => setAffiliateLink(e.target.value)}
            placeholder="https://glitchy.com/ref/yourlink"
            icon={<LinkIcon className="h-4 w-4" />}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const cfg = PLATFORM_CONFIG[p]
                const active = selectedPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? `${cfg.bgColor} ${cfg.color} border-current/30`
                        : 'border-bg-border text-slate-500 hover:border-bg-hover'
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Button variant="primary" className="w-full mt-2" onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
            Create Campaign
          </Button>
        </div>
      </Modal>
    </PageShell>
  )
}

function CampaignCard({ campaign, onDelete, onToggleStatus, onCopyLink }: {
  campaign: Campaign
  onDelete: () => void
  onToggleStatus: () => void
  onCopyLink: () => void
}) {
  return (
    <div className="card-base hover:border-brand-600/20 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-600/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Target className="h-5 w-5 text-brand-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{campaign.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">{campaign.niche}</span>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500">{formatRelativeTime(campaign.createdAt)}</span>
              </div>
            </div>
            <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'}>
              {campaign.status}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Clicks</p>
              <p className="text-sm font-bold text-slate-100">{formatNumber(campaign.totalClicks)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Earnings</p>
              <p className="text-sm font-bold text-emerald-400">{formatCurrency(campaign.totalEarnings)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Conv. Rate</p>
              <p className="text-sm font-bold text-blue-400">{campaign.conversionRate}%</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Videos</p>
              <p className="text-sm font-bold text-slate-100">{campaign.videoCount}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Platforms</p>
              <div className="flex gap-1 mt-0.5">
                {campaign.platforms.slice(0, 3).map(p => {
                  const cfg = PLATFORM_CONFIG[p]
                  return <span key={p} className={`text-[10px] ${cfg.color}`}>{cfg.label.split(' ')[0]}</span>
                })}
              </div>
            </div>
          </div>

          {/* Link row */}
          <div className="flex items-center gap-2 p-2 bg-bg-surface rounded-lg mb-3">
            <LinkIcon className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-400 truncate flex-1">{campaign.affiliateLink}</p>
            <button onClick={onCopyLink} className="p-1 text-slate-400 hover:text-slate-100 transition-colors flex-shrink-0">
              <Copy className="h-3 w-3" />
            </button>
            <a href={campaign.affiliateLink} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-slate-100 transition-colors flex-shrink-0">
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleStatus}
              icon={campaign.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}>
              {campaign.status === 'active' ? 'Pause' : 'Resume'}
            </Button>
            <Link href="/scripts">
              <Button variant="ghost" size="sm" icon={<Video className="h-3.5 w-3.5" />}>
                Make Content
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" icon={<TrendingUp className="h-3.5 w-3.5" />}>
                Analytics
              </Button>
            </Link>
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5 text-red-400" />} onClick={onDelete} className="ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
