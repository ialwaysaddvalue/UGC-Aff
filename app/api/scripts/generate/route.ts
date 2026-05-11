import { NextRequest, NextResponse } from 'next/server'
import { generateScriptWithClaude } from '@/lib/anthropic'
import { generateScriptWithOpenAI } from '@/lib/openai'
import { ScriptGenerationRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ScriptGenerationRequest & { apiKey?: string }
    const { apiKey, ...request } = body

    if (!request.niche || !request.offer) {
      return NextResponse.json({ error: 'niche and offer are required' }, { status: 400 })
    }

    const provider = request.provider || 'claude'
    const result = provider === 'claude'
      ? await generateScriptWithClaude(request, apiKey)
      : await generateScriptWithOpenAI(request, apiKey)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Script generation failed'
    console.error('Script generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
