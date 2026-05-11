import { NextRequest, NextResponse } from 'next/server'
import { analyzeTrendingContent } from '@/lib/anthropic'
import { generateCaptionAndHashtags } from '@/lib/openai'
import { TrendResult } from '@/types'
import { generateId } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { niche, platform = 'tiktok', provider = 'claude', apiKey } = body

    if (!niche) {
      return NextResponse.json({ error: 'niche is required' }, { status: 400 })
    }

    const analysis = await analyzeTrendingContent(niche, platform, apiKey)

    const trends: TrendResult[] = analysis.angles.map((angle, i) => ({
      id: generateId(),
      title: angle,
      niche,
      platform,
      views: Math.floor(Math.random() * 900000) + 100000,
      engagement: Math.floor(Math.random() * 15) + 3,
      hook: analysis.hooks[i] || analysis.hooks[0],
      angle,
      tags: [niche.toLowerCase().replace(/ /g, ''), 'viral', platform],
      viralScore: Math.floor(Math.random() * 40) + 60,
      suggestedOffers: ['Glitchy Affiliate', niche + ' Course'],
    }))

    return NextResponse.json({
      trends,
      hooks: analysis.hooks,
      patterns: analysis.patterns,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Research failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { script, platform, niche, apiKey } = body

    if (!script || !platform || !niche) {
      return NextResponse.json({ error: 'script, platform, and niche are required' }, { status: 400 })
    }

    const result = await generateCaptionAndHashtags(script, platform, niche, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Caption generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
