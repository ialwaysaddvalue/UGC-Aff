import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Platform } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bgColor: string }> = {
  tiktok: { label: 'TikTok', color: 'text-pink-400', bgColor: 'bg-pink-400/10' },
  instagram: { label: 'Instagram', color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  youtube: { label: 'YouTube Shorts', color: 'text-red-400', bgColor: 'bg-red-400/10' },
  facebook: { label: 'Facebook', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  snapchat: { label: 'Snapchat', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function estimateReadingTime(text: string): number {
  const words = text.split(' ').length
  return Math.ceil((words / 130) * 60)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function extractHashtags(text: string): string[] {
  return (text.match(/#[\w]+/g) || []).map(t => t.slice(1))
}

export const NICHE_OPTIONS = [
  'Health & Fitness',
  'Make Money Online',
  'Beauty & Skincare',
  'Tech & Gadgets',
  'Personal Finance',
  'Relationships & Dating',
  'Weight Loss',
  'Digital Marketing',
  'Crypto & Investing',
  'Self Improvement',
  'Food & Recipes',
  'Travel',
  'Fashion & Style',
  'Gaming',
  'Parenting',
]

export const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual & Relatable' },
  { value: 'energetic', label: 'Energetic & Hype' },
  { value: 'professional', label: 'Professional & Authoritative' },
  { value: 'storytelling', label: 'Storytelling & Narrative' },
]
