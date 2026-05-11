import Anthropic from '@anthropic-ai/sdk'
import { ScriptGenerationRequest, ScriptGenerationResponse } from '@/types'

function getClient(apiKey?: string): Anthropic {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('Anthropic API key is required')
  return new Anthropic({ apiKey: key })
}

export async function generateScriptWithClaude(
  request: ScriptGenerationRequest,
  apiKey?: string
): Promise<ScriptGenerationResponse> {
  const client = getClient(apiKey)

  const systemPrompt = `You are an expert short-form content creator and copywriter specializing in UGC (User Generated Content) for affiliate marketing.
You understand viral content patterns, psychological hooks, and what drives clicks and conversions on TikTok, Instagram Reels, and YouTube Shorts.
Your scripts are conversational, authentic, and designed to feel like real person content — not ads.
Always respond with valid JSON only, no markdown code blocks.`

  const userPrompt = `Create a high-converting UGC video script for this offer:

NICHE: ${request.niche}
OFFER: ${request.offer}
TARGET AUDIENCE: ${request.targetAudience || 'General audience interested in ' + request.niche}
TONE: ${request.tone || 'casual'}
HOOK VARIATIONS NEEDED: ${request.hookCount || 5}

Requirements:
- Hook must be under 3 seconds (15 words max) and create immediate curiosity or address a pain point
- Body should be 30-45 seconds (75-100 words), clear and benefit-focused
- CTA must be specific: "Link in bio" or "Comment [word] and I'll send you the link"
- The full script should feel authentic, NOT like an ad
- Generate ${request.hookCount || 5} different hook variations for A/B testing

Return ONLY this JSON structure:
{
  "hook": "primary hook here",
  "body": "main body of the script",
  "cta": "call to action",
  "fullScript": "complete script combining hook + body + cta",
  "hookVariations": ["variation 1", "variation 2", "variation 3", "variation 4", "variation 5"],
  "estimatedDuration": 45
}`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1500,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  const parsed = JSON.parse(content.text) as ScriptGenerationResponse
  return parsed
}

export async function generateHookVariationsWithClaude(
  niche: string,
  offer: string,
  existingHook: string,
  count: number = 10,
  apiKey?: string
): Promise<string[]> {
  const client = getClient(apiKey)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `Generate ${count} different hook variations for a UGC video about:
Niche: ${niche}
Offer: ${offer}
Base hook: "${existingHook}"

Rules:
- Each hook must be under 15 words
- Mix curiosity, pain points, social proof, and surprising facts
- Make them feel authentic and conversational
- No hashtags or emojis

Return ONLY a JSON array of strings: ["hook1", "hook2", ...]`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return JSON.parse(content.text) as string[]
}

export async function analyzeTrendingContent(
  niche: string,
  platform: string,
  apiKey?: string
): Promise<{ angles: string[]; hooks: string[]; patterns: string[] }> {
  const client = getClient(apiKey)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Analyze what's currently working for viral short-form content in the ${niche} niche on ${platform}.

Based on your knowledge of viral content patterns, provide:
- 5 content angles that consistently go viral
- 5 hook templates that perform well
- 5 patterns/styles that creators are using

Return ONLY this JSON:
{
  "angles": ["angle1", ...],
  "hooks": ["hook template 1", ...],
  "patterns": ["pattern 1", ...]
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return JSON.parse(content.text)
}
