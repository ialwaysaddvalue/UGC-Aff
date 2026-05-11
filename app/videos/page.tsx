'use client'
import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { formatRelativeTime } from '@/lib/utils'
import { HeyGenAvatar, Video as VideoType, VideoProvider } from '@/types'
import {
  Video, Plus, Play, Download, Trash2, Loader2, CheckCircle2,
  Sparkles, User, Clapperboard, Clock, RefreshCw, ExternalLink, Send,
} from 'lucide-react'
import Link from 'next/link'

const HEYGEN_BACKGROUNDS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#1A1A2E', label: 'Dark Studio' },
  { value: '#F8F4F0', label: 'Cream' },
  { value: '#E8F5E9', label: 'Light Green' },
  { value: '#E3F2FD', label: 'Light Blue' },
]

const HIGGSFIELD_STYLES = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'animated', label: 'Animated' },
]

export default function VideosPage() {
  const { videos, scripts, addVideo, updateVideo, deleteVideo, settings } = useAppStore()
  const [showCreator, setShowCreator] = useState(false)
  const [provider, setProvider] = useState<VideoProvider>(settings.defaultVideoProvider)
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  const [avatars, setAvatars] = useState<HeyGenAvatar[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [script, setScript] = useState('')
  const [prompt, setPrompt] = useState('')
  const [background, setBackground] = useState('#FFFFFF')
  const [style, setStyle] = useState('realistic')
  const [duration, setDuration] = useState('6')
  const [generating, setGenerating] = useState(false)
  const [pollingId, setPollingId] = useState<string | null>(null)

  useEffect(() => {
    if (provider === 'heygen' && showCreator) {
      loadAvatars()
    }
  }, [provider, showCreator])

  async function loadAvatars() {
    setLoadingAvatars(true)
    try {
      const res = await fetch(`/api/videos/heygen?action=avatars&apiKey=${encodeURIComponent(settings.heygenApiKey || '')}`)
      if (res.ok) {
        const data = await res.json()
        setAvatars(data.avatars || [])
        if (data.avatars?.length > 0) setSelectedAvatar(data.avatars[0].avatarId)
      }
    } catch {
      toast('warning', 'Could not load HeyGen avatars', 'Check your API key in Settings')
    } finally {
      setLoadingAvatars(false)
    }
  }

  async function handleCreateVideo() {
    if (provider === 'heygen' && (!selectedAvatar || !script.trim())) {
      toast('warning', 'Missing fields', 'Select an avatar and enter your script')
      return
    }
    if (provider === 'higgsfield' && !prompt.trim()) {
      toast('warning', 'Missing fields', 'Enter a video prompt')
      return
    }

    setGenerating(true)
    const videoTitle = provider === 'heygen' ? `HeyGen — ${script.substring(0, 40)}...` : `Higgsfield — ${prompt.substring(0, 40)}...`

    const video = addVideo({
      title: videoTitle,
      provider,
      avatarId: selectedAvatar,
      avatarName: avatars.find(a => a.avatarId === selectedAvatar)?.avatarName,
      status: 'generating',
      progress: 0,
    })

    try {
      const endpoint = provider === 'heygen' ? '/api/videos/heygen' : '/api/videos/higgsfield'
      const body = provider === 'heygen'
        ? { avatarId: selectedAvatar, script, background, apiKey: settings.heygenApiKey }
        : { prompt, style, duration: parseInt(duration), aspectRatio: '9:16', apiKey: settings.higgsfieldApiKey }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const result = await res.json()
      const jobId = result.videoId || result.jobId
      updateVideo(video.id, { providerJobId: jobId, status: 'processing', progress: 20 })

      setPollingId(video.id)
      pollVideoStatus(video.id, jobId, provider)

      toast('success', 'Video generation started!', 'Check back in 2-5 minutes')
      setShowCreator(false)
      setScript('')
      setPrompt('')
    } catch (err) {
      updateVideo(video.id, { status: 'failed' })
      toast('error', 'Video creation failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setGenerating(false)
    }
  }

  async function pollVideoStatus(videoId: string, jobId: string, prov: VideoProvider) {
    const endpoint = prov === 'heygen'
      ? `/api/videos/heygen?action=status&videoId=${jobId}&apiKey=${encodeURIComponent(settings.heygenApiKey || '')}`
      : `/api/videos/higgsfield?action=status&jobId=${jobId}&apiKey=${encodeURIComponent(settings.higgsfieldApiKey || '')}`

    let attempts = 0
    const maxAttempts = 60

    const poll = async () => {
      if (attempts >= maxAttempts) {
        updateVideo(videoId, { status: 'failed' })
        return
      }
      attempts++
      try {
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          const progress = Math.min(90, 20 + (attempts / maxAttempts) * 70)
          updateVideo(videoId, { status: data.status, progress, videoUrl: data.videoUrl })
          if (data.status === 'ready') {
            updateVideo(videoId, { status: 'ready', progress: 100 })
            toast('success', 'Video ready!', 'Your video has been generated')
            setPollingId(null)
            return
          }
          if (data.status === 'failed') {
            updateVideo(videoId, { status: 'failed' })
            setPollingId(null)
            return
          }
        }
      } catch { /* continue polling */ }
      setTimeout(poll, 5000)
    }

    setTimeout(poll, 5000)
  }

  return (
    <PageShell
      title="Videos"
      subtitle="Create AI UGC videos with HeyGen & Higgsfield"
      actions={
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreator(true)}>
          Create Video
        </Button>
      }
    >
      {/* Provider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 bg-bg-card border border-bg-border rounded-2xl hover:border-violet-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">HeyGen</p>
              <p className="text-xs text-slate-500">AI Avatar Videos</p>
            </div>
            <Badge variant="brand" className="ml-auto">UGC Style</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose from 100+ AI avatars. Paste your script and generate videos that look like authentic creator content filmed on a phone. Perfect for UGC-style affiliate content.
          </p>
        </div>

        <div className="p-5 bg-bg-card border border-bg-border rounded-2xl hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Clapperboard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Higgsfield AI</p>
              <p className="text-xs text-slate-500">Cinematic Video Gen</p>
            </div>
            <Badge variant="info" className="ml-auto">B-Roll</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate cinematic B-roll and background footage with text prompts. Use to supplement your avatar content or create standalone visually compelling videos.
          </p>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="card-base text-center py-16">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-base font-semibold text-slate-200">No videos yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Create your first AI UGC video. Normally brands pay hundreds — AI does it in minutes.
          </p>
          <Button variant="primary" className="mt-4" icon={<Sparkles className="h-4 w-4" />} onClick={() => setShowCreator(true)}>
            Create First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={() => { deleteVideo(video.id); toast('info', 'Video deleted') }}
              onRetry={() => setShowCreator(true)}
            />
          ))}
        </div>
      )}

      {/* Video Creator Modal */}
      <Modal
        open={showCreator}
        onClose={() => setShowCreator(false)}
        title="Create AI Video"
        description="Generate UGC-style content with AI"
        size="xl"
      >
        <Tabs defaultValue={provider} onValueChange={(v) => setProvider(v as VideoProvider)}>
          <TabsList>
            <TabsTrigger value="heygen">HeyGen Avatar</TabsTrigger>
            <TabsTrigger value="higgsfield">Higgsfield AI</TabsTrigger>
          </TabsList>

          <TabsContent value="heygen">
            <div className="space-y-4">
              {scripts.length > 0 && (
                <Select
                  label="Use saved script"
                  value=""
                  onChange={(v) => {
                    const s = scripts.find(s => s.id === v)
                    if (s) setScript(s.fullScript)
                  }}
                  placeholder="Select a script..."
                  options={scripts.map(s => ({ value: s.id, label: s.title }))}
                />
              )}

              <Textarea
                label="Script"
                value={script}
                onChange={e => setScript(e.target.value)}
                placeholder="Paste or type your UGC script here..."
                className="min-h-[120px]"
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Avatar</label>
                {loadingAvatars ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading avatars...
                  </div>
                ) : avatars.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                    {avatars.slice(0, 16).map(avatar => (
                      <div
                        key={avatar.avatarId}
                        onClick={() => setSelectedAvatar(avatar.avatarId)}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          selectedAvatar === avatar.avatarId
                            ? 'border-brand-500 shadow-glow-brand'
                            : 'border-bg-border hover:border-bg-hover'
                        }`}
                      >
                        {avatar.previewImageUrl ? (
                          <img src={avatar.previewImageUrl} alt={avatar.avatarName} className="w-full h-20 object-cover" />
                        ) : (
                          <div className="w-full h-20 bg-bg-surface flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-500" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                          <p className="text-[10px] text-white truncate">{avatar.avatarName}</p>
                        </div>
                        {selectedAvatar === avatar.avatarId && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="h-4 w-4 text-brand-400 bg-bg-base rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-bg-surface border border-bg-border rounded-xl text-center">
                    <p className="text-xs text-slate-400">No avatars loaded.</p>
                    <p className="text-xs text-slate-500 mt-1">Add your HeyGen API key in <Link href="/settings" className="text-brand-400 hover:underline">Settings</Link></p>
                  </div>
                )}
              </div>

              <Select
                label="Background"
                value={background}
                onChange={setBackground}
                options={HEYGEN_BACKGROUNDS}
              />
            </div>
          </TabsContent>

          <TabsContent value="higgsfield">
            <div className="space-y-4">
              <Textarea
                label="Video Prompt"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A confident young woman in a casual home setting, speaking directly to camera about financial freedom..."
                className="min-h-[120px]"
                hint="Be specific about setting, person, and mood for best results"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Style"
                  value={style}
                  onChange={setStyle}
                  options={HIGGSFIELD_STYLES}
                />
                <Select
                  label="Duration"
                  value={duration}
                  onChange={setDuration}
                  options={[
                    { value: '6', label: '6 seconds' },
                    { value: '9', label: '9 seconds' },
                    { value: '12', label: '12 seconds' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-bg-border">
          <Button
            variant="primary"
            className="w-full"
            loading={generating}
            onClick={handleCreateVideo}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {generating ? 'Starting generation...' : `Generate with ${provider === 'heygen' ? 'HeyGen' : 'Higgsfield'}`}
          </Button>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Video generation takes 2-5 minutes. You can close this and check back.
          </p>
        </div>
      </Modal>
    </PageShell>
  )
}

function VideoCard({ video, onDelete, onRetry }: { video: VideoType; onDelete: () => void; onRetry: () => void }) {
  const isProcessing = video.status === 'generating' || video.status === 'processing'

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[9/16] max-h-[200px] bg-bg-surface rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : video.videoUrl ? (
          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-5 w-5 text-gray-900 ml-0.5" />
            </div>
          </a>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <p className="text-xs">Generating...</p>
              </>
            ) : video.status === 'failed' ? (
              <>
                <Video className="h-8 w-8 text-red-500/50" />
                <p className="text-xs text-red-400">Failed</p>
              </>
            ) : (
              <Video className="h-8 w-8" />
            )}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={
            video.status === 'ready' ? 'success' :
            video.status === 'failed' ? 'danger' :
            isProcessing ? 'brand' : 'default'
          }>
            {video.status}
          </Badge>
        </div>
      </div>

      {isProcessing && video.progress !== undefined && (
        <Progress value={video.progress} size="sm" className="mb-3" showLabel />
      )}

      <p className="text-xs font-semibold text-slate-200 truncate mb-1">{video.title}</p>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={video.provider === 'heygen' ? 'brand' : 'info'} className="text-[10px]">
          {video.provider === 'heygen' ? 'HeyGen' : 'Higgsfield'}
        </Badge>
        {video.avatarName && (
          <span className="text-[10px] text-slate-500">{video.avatarName}</span>
        )}
        <span className="text-[10px] text-slate-600 ml-auto">{formatRelativeTime(video.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-bg-border">
        {video.videoUrl && (
          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>View</Button>
          </a>
        )}
        {video.status === 'ready' && (
          <Link href="/publish">
            <Button variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />}>Publish</Button>
          </Link>
        )}
        {video.status === 'failed' && (
          <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={onRetry}>Retry</Button>
        )}
        <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5 text-red-400" />} onClick={onDelete} className="ml-auto" />
      </div>
    </Card>
  )
}
