import { NextRequest, NextResponse } from 'next/server'
import { generateHookVariationsWithClaude } from '@/lib/anthropic'
import { generateHookVariationsWithOpenAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { niche, offer, existingHook, count = 10, provider = 'claude', apiKey } = body

    if (!niche || !existingHook) {
      return NextResponse.json({ error: 'niche and existingHook are required' }, { status: 400 })
    }

    const hooks = provider === 'claude'
      ? await generateHookVariationsWithClaude(niche, offer, existingHook, count, apiKey)
      : await generateHookVariationsWithOpenAI(niche, offer, existingHook, count, apiKey)

    return NextResponse.json({ hooks })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hook generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
