'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { formatRelativeTime, PLATFORM_CONFIG } from '@/lib/utils'
import { Platform, PublishJob, Video as VideoType } from '@/types'
import {
  Send, Plus, Sparkles, CheckCircle2, Clock, AlertCircle,
  Zap, Globe, RefreshCw, Copy, Hash, Video, Calendar,
} from 'lucide-react'

const ALL_PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'snapchat'] as Platform[]

const POSTING_TIPS = [
  'Post minimum 3x per day for maximum reach',
  'TikTok rewards consistency — same time each day',
  'Use different hooks for each platform repost',
  'Engage with comments in the first hour after posting',
  'Warm up new accounts with 3-5 days of organic engagement first',
]

export default function PublishPage() {
  const { videos, publishJobs, scripts, addPublishJob, updatePublishJob, settings } = useAppStore()
  const [showScheduler, setShowScheduler] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'instagram', 'youtube'])
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState('')

  const readyVideos = videos.filter(v => v.status === 'ready')

  function togglePlatform(p: Platform) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function generateCaption() {
    if (!selectedVideo || !selectedNiche) {
      toast('warning', 'Select a video and niche first')
      return
    }
    setGeneratingCaption(true)
    try {
      const scriptContent = selectedVideo.title
      const res = await fetch('/api/publish/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptContent,
          platform: selectedPlatforms[0] || 'tiktok',
          niche: selectedNiche,
          apiKey: settings.openaiApiKey,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCaption(data.caption)
        setHashtags(data.hashtags || [])
        toast('success', 'Caption generated!')
      } else {
        throw new Error('Caption generation failed')
      }
    } catch (err) {
      toast('error', 'Failed', err instanceof Error ? err.message : 'Try adding your OpenAI key in Settings')
    } finally {
      setGeneratingCaption(false)
    }
  }

  async function handlePublish() {
    if (!selectedVideo || selectedPlatforms.length === 0) {
      toast('warning', 'Select a video and at least one platform')
      return
    }
    if (!caption.trim()) {
      toast('warning', 'Add a caption before publishing')
      return
    }
    setPublishing(true)

    const job = addPublishJob({
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
      platforms: selectedPlatforms,
      caption,
      hashtags,
      status: 'publishing',
    })

    // Simulate publishing to platforms (in production you'd integrate platform APIs)
    await new Promise(r => setTimeout(r, 2000))
    const results = {} as Record<Platform, { success: boolean; url?: string; error?: string }>
    selectedPlatforms.forEach(p => {
      results[p] = { success: true, url: '#' }
    })

    updatePublishJob(job.id, { status: 'published', results })
    toast('success', 'Published!', `Posted to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}`)

    setPublishing(false)
    setShowScheduler(false)
    setCaption('')
    setHashtags([])
    setSelectedVideo(null)
  }

  return (
    <PageShell
      title="Publisher"
      subtitle="Publish your content across 5 platforms simultaneously"
      actions={
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowScheduler(true)}>
          Publish Content
        </Button>
      }
    >
      {/* Platform Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ALL_PLATFORMS.map(p => {
          const cfg = PLATFORM_CONFIG[p]
          const jobsOnPlatform = publishJobs.filter(j => j.platforms.includes(p) && j.status === 'published').length
          return (
            <div key={p} className={`p-4 bg-bg-card border border-bg-border rounded-2xl hover:border-current/30 transition-colors ${cfg.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                <div className={`w-2 h-2 rounded-full ${jobsOnPlatform > 0 ? 'bg-emerald-400' : 'bg-bg-border'}`} />
              </div>
              <p className="text-2xl font-bold text-slate-100">{jobsOnPlatform}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">posts published</p>
            </div>
          )
        })}
      </div>

      {/* Posting Strategy */}
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Posting Strategy</h3>
          <Badge variant="warning">3 posts/day minimum</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {POSTING_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-bg-surface rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Queue */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">Publish History</h3>
          <Badge variant="default">{publishJobs.length} total</Badge>
        </div>

        {publishJobs.length === 0 ? (
          <div className="py-10 text-center">
            <Globe className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No published posts yet</p>
            <p className="text-xs text-slate-600 mt-1">
              {readyVideos.length > 0
                ? 'You have videos ready to publish!'
                : 'Create videos first, then publish them here'}
            </p>
            {readyVideos.length > 0 && (
              <Button variant="primary" className="mt-4" icon={<Send className="h-4 w-4" />} onClick={() => setShowScheduler(true)}>
                Publish Now
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {publishJobs.map(job => (
              <div key={job.id} className="p-4 bg-bg-surface border border-bg-border rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-slate-200 flex-1 min-w-0 pr-3 truncate">{job.videoTitle}</p>
                  <Badge variant={
                    job.status === 'published' ? 'success' :
                    job.status === 'publishing' ? 'brand' :
                    job.status === 'failed' ? 'danger' : 'default'
                  }>
                    {job.status === 'published' ? <><CheckCircle2 className="h-3 w-3 mr-1" />Published</> :
                     job.status === 'publishing' ? <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Publishing</> :
                     job.status === 'failed' ? <><AlertCircle className="h-3 w-3 mr-1" />Failed</> :
                     <><Clock className="h-3 w-3 mr-1" />Scheduled</>}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {job.platforms.map(p => {
                    const cfg = PLATFORM_CONFIG[p]
                    return (
                      <span key={p} className={`text-[10px] px-2 py-0.5 rounded-md ${cfg.bgColor} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
                {job.caption && (
                  <p className="text-xs text-slate-500 line-clamp-1 mb-1">{job.caption}</p>
                )}
                <p className="text-[10px] text-slate-600">{formatRelativeTime(job.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Modal */}
      <Modal
        open={showScheduler}
        onClose={() => setShowScheduler(false)}
        title="Publish Content"
        description="Post your video to multiple platforms at once"
        size="xl"
      >
        <div className="space-y-4">
          {/* Video Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Video</label>
            {readyVideos.length === 0 ? (
              <div className="p-4 bg-bg-surface border border-bg-border rounded-xl text-center">
                <Video className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No ready videos.</p>
                <p className="text-xs text-slate-500">Create and process a video first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                {readyVideos.map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVideo(v)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedVideo?.id === v.id
                        ? 'border-brand-500 bg-brand-600/10'
                        : 'border-bg-border bg-bg-surface hover:border-bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Video className={`h-4 w-4 flex-shrink-0 ${selectedVideo?.id === v.id ? 'text-brand-400' : 'text-slate-500'}`} />
                      <p className="text-xs text-slate-300 truncate">{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map(p => {
                const cfg = PLATFORM_CONFIG[p]
                const active = selectedPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
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

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">Caption</label>
              <Button
                variant="ghost"
                size="sm"
                loading={generatingCaption}
                onClick={generateCaption}
                icon={<Sparkles className="h-3.5 w-3.5" />}
              >
                AI Generate
              </Button>
            </div>
            <Textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your caption or use AI to generate one..."
              className="min-h-[80px]"
            />
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Hashtags</label>
                <button
                  onClick={() => { navigator.clipboard.writeText(hashtags.map(h => `#${h}`).join(' ')); toast('success', 'Copied!') }}
                  className="p-1 text-slate-400 hover:text-slate-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 bg-bg-surface rounded-xl">
                {hashtags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-brand-600/10 text-brand-300 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            loading={publishing}
            onClick={handlePublish}
            icon={<Send className="h-4 w-4" />}
          >
            {publishing ? 'Publishing...' : `Publish to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
          </Button>

          <p className="text-[11px] text-slate-500 text-center">
            Direct platform API integrations coming soon. Currently creates a publish record for manual posting.
          </p>
        </div>
      </Modal>
    </PageShell>
  )
}
