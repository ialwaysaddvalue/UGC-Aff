// ============================================================
// Core domain types for UGC-Aff platform
// ============================================================

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'snapchat'

export type VideoStatus = 'idle' | 'generating' | 'processing' | 'ready' | 'failed'

export type ScriptStatus = 'draft' | 'ready' | 'used'

export type CampaignStatus = 'active' | 'paused' | 'archived'

export type VideoProvider = 'heygen' | 'higgsfield'

export type AIProvider = 'claude' | 'openai'

// ─── Script ────────────────────────────────────────────────
export interface Script {
  id: string
  title: string
  niche: string
  hook: string
  body: string
  cta: string
  fullScript: string
  status: ScriptStatus
  aiProvider: AIProvider
  hookVariations?: string[]
  createdAt: string
  campaignId?: string
}

// ─── Video ─────────────────────────────────────────────────
export interface Video {
  id: string
  title: string
  scriptId?: string
  provider: VideoProvider
  avatarId?: string
  avatarName?: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  status: VideoStatus
  progress?: number
  providerJobId?: string
  platforms?: Platform[]
  createdAt: string
}

// ─── Campaign ──────────────────────────────────────────────
export interface Campaign {
  id: string
  name: string
  niche: string
  offer: string
  affiliateLink: string
  glitchyOfferId?: string
  status: CampaignStatus
  totalClicks: number
  totalEarnings: number
  conversionRate: number
  videoCount: number
  platforms: Platform[]
  createdAt: string
  updatedAt: string
}

// ─── TrendResult ───────────────────────────────────────────
export interface TrendResult {
  id: string
  title: string
  niche: string
  platform: Platform
  views: number
  engagement: number
  hook: string
  angle: string
  tags: string[]
  viralScore: number
  suggestedOffers?: string[]
}

// ─── PublishJob ────────────────────────────────────────────
export interface PublishJob {
  id: string
  videoId: string
  videoTitle: string
  platforms: Platform[]
  caption: string
  hashtags: string[]
  scheduledAt?: string
  status: 'scheduled' | 'publishing' | 'published' | 'failed'
  results?: Record<Platform, { success: boolean; url?: string; error?: string }>
  createdAt: string
}

// ─── Analytics ─────────────────────────────────────────────
export interface AnalyticsMetric {
  date: string
  clicks: number
  views: number
  conversions: number
  earnings: number
}

export interface PlatformAnalytics {
  platform: Platform
  views: number
  clicks: number
  ctr: number
  earnings: number
  topVideo?: string
}

// ─── Avatar (HeyGen) ───────────────────────────────────────
export interface HeyGenAvatar {
  avatarId: string
  avatarName: string
  gender: string
  previewImageUrl: string
  previewVideoUrl?: string
}

// ─── HeyGen Video Generation ──────────────────────────────
export interface HeyGenVideoRequest {
  avatarId: string
  script: string
  voiceId?: string
  background?: string
  dimension?: { width: number; height: number }
}

export interface HeyGenVideoResponse {
  videoId: string
  status: VideoStatus
  videoUrl?: string
}

// ─── Higgsfield ────────────────────────────────────────────
export interface HiggsfieldVideoRequest {
  prompt: string
  style?: string
  duration?: number
  aspectRatio?: '9:16' | '16:9' | '1:1'
}

export interface HiggsfieldVideoResponse {
  jobId: string
  status: VideoStatus
  videoUrl?: string
  thumbnailUrl?: string
}

// ─── Script Generation ────────────────────────────────────
export interface ScriptGenerationRequest {
  niche: string
  offer: string
  targetAudience?: string
  tone?: 'casual' | 'energetic' | 'professional' | 'storytelling'
  hookCount?: number
  provider: AIProvider
}

export interface ScriptGenerationResponse {
  hook: string
  body: string
  cta: string
  fullScript: string
  hookVariations: string[]
  estimatedDuration: number
}

// ─── Settings ──────────────────────────────────────────────
export interface AppSettings {
  openaiApiKey: string
  anthropicApiKey: string
  heygenApiKey: string
  higgsfieldApiKey: string
  glitchyApiKey: string
  glitchyPublisherId: string
  defaultPlatforms: Platform[]
  defaultAiProvider: AIProvider
  defaultVideoProvider: VideoProvider
  postsPerDay: number
  defaultNiche: string
}
