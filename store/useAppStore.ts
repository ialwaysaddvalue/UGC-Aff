import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Script, Video, Campaign, PublishJob, AppSettings, Platform } from '@/types'
import { generateId } from '@/lib/utils'

interface AppState {
  // Data
  scripts: Script[]
  videos: Video[]
  campaigns: Campaign[]
  publishJobs: PublishJob[]
  settings: AppSettings

  // Script actions
  addScript: (script: Omit<Script, 'id' | 'createdAt'>) => Script
  updateScript: (id: string, updates: Partial<Script>) => void
  deleteScript: (id: string) => void

  // Video actions
  addVideo: (video: Omit<Video, 'id' | 'createdAt'>) => Video
  updateVideo: (id: string, updates: Partial<Video>) => void
  deleteVideo: (id: string) => void

  // Campaign actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'totalClicks' | 'totalEarnings' | 'conversionRate' | 'videoCount'>) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void

  // Publish actions
  addPublishJob: (job: Omit<PublishJob, 'id' | 'createdAt'>) => PublishJob
  updatePublishJob: (id: string, updates: Partial<PublishJob>) => void

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  openaiApiKey: '',
  anthropicApiKey: '',
  heygenApiKey: '',
  higgsfieldApiKey: '',
  glitchyApiKey: '',
  glitchyPublisherId: '',
  defaultPlatforms: ['tiktok', 'instagram', 'youtube'] as Platform[],
  defaultAiProvider: 'claude',
  defaultVideoProvider: 'heygen',
  postsPerDay: 3,
  defaultNiche: '',
}

const seedCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Glitchy — Make Money Online',
    niche: 'Make Money Online',
    offer: 'Glitchy Affiliate Platform',
    affiliateLink: 'https://glitchy.com/ref/yourlink',
    status: 'active',
    totalClicks: 2847,
    totalEarnings: 412.50,
    conversionRate: 3.2,
    videoCount: 12,
    platforms: ['tiktok', 'instagram', 'youtube'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const seedAnalyticsData = [
  { date: '2025-05-04', clicks: 124, views: 8420, conversions: 4, earnings: 58.0 },
  { date: '2025-05-05', clicks: 198, views: 11200, conversions: 7, earnings: 102.5 },
  { date: '2025-05-06', clicks: 156, views: 9830, conversions: 5, earnings: 73.0 },
  { date: '2025-05-07', clicks: 312, views: 18400, conversions: 11, earnings: 160.5 },
  { date: '2025-05-08', clicks: 267, views: 15600, conversions: 9, earnings: 131.5 },
  { date: '2025-05-09', clicks: 189, views: 12100, conversions: 6, earnings: 87.5 },
  { date: '2025-05-10', clicks: 445, views: 26800, conversions: 15, earnings: 219.0 },
  { date: '2025-05-11', clicks: 321, views: 19200, conversions: 11, earnings: 161.0 },
]

// Make analytics data accessible globally
if (typeof window !== 'undefined') {
  (window as typeof window & { __analyticsData: typeof seedAnalyticsData }).__analyticsData = seedAnalyticsData
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scripts: [],
      videos: [],
      campaigns: seedCampaigns,
      publishJobs: [],
      settings: defaultSettings,

      addScript: (scriptData) => {
        const script: Script = {
          ...scriptData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ scripts: [script, ...state.scripts] }))
        return script
      },

      updateScript: (id, updates) => {
        set(state => ({
          scripts: state.scripts.map(s => s.id === id ? { ...s, ...updates } : s),
        }))
      },

      deleteScript: (id) => {
        set(state => ({ scripts: state.scripts.filter(s => s.id !== id) }))
      },

      addVideo: (videoData) => {
        const video: Video = {
          ...videoData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ videos: [video, ...state.videos] }))
        return video
      },

      updateVideo: (id, updates) => {
        set(state => ({
          videos: state.videos.map(v => v.id === id ? { ...v, ...updates } : v),
        }))
      },

      deleteVideo: (id) => {
        set(state => ({ videos: state.videos.filter(v => v.id !== id) }))
      },

      addCampaign: (campaignData) => {
        const campaign: Campaign = {
          ...campaignData,
          id: generateId(),
          totalClicks: 0,
          totalEarnings: 0,
          conversionRate: 0,
          videoCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ campaigns: [campaign, ...state.campaigns] }))
        return campaign
      },

      updateCampaign: (id, updates) => {
        set(state => ({
          campaigns: state.campaigns.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      deleteCampaign: (id) => {
        set(state => ({ campaigns: state.campaigns.filter(c => c.id !== id) }))
      },

      addPublishJob: (jobData) => {
        const job: PublishJob = {
          ...jobData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set(state => ({ publishJobs: [job, ...state.publishJobs] }))
        return job
      },

      updatePublishJob: (id, updates) => {
        set(state => ({
          publishJobs: state.publishJobs.map(j => j.id === id ? { ...j, ...updates } : j),
        }))
      },

      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }))
      },
    }),
    {
      name: 'ugc-aff-storage',
      partialize: (state) => ({
        scripts: state.scripts,
        videos: state.videos,
        campaigns: state.campaigns,
        publishJobs: state.publishJobs,
        settings: state.settings,
      }),
    }
  )
)

export { seedAnalyticsData }
