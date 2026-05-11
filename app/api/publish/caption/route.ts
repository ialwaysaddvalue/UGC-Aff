import { NextRequest, NextResponse } from 'next/server'
import { generateCaptionAndHashtags } from '@/lib/openai'

export async function POST(req: NextRequest) {
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
