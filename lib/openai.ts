import OpenAI from 'openai'
import { ScriptGenerationRequest, ScriptGenerationResponse } from '@/types'

function getClient(apiKey?: string): OpenAI {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) throw new Error('OpenAI API key is required')
  return new OpenAI({ apiKey: key })
}

export async function generateScriptWithOpenAI(
  request: ScriptGenerationRequest,
  apiKey?: string
): Promise<ScriptGenerationResponse> {
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert UGC content creator and direct-response copywriter.
You create authentic, high-converting short-form video scripts for affiliate marketing.
Your scripts feel like real person content, not ads. Always respond with valid JSON only.`,
      },
      {
        role: 'user',
        content: `Create a UGC video script for:
NICHE: ${request.niche}
OFFER: ${request.offer}
AUDIENCE: ${request.targetAudience || 'General interest in ' + request.niche}
TONE: ${request.tone || 'casual'}

Rules:
- Hook: under 15 words, immediate curiosity or pain point
- Body: 75-100 words, clear benefit explanation
- CTA: "Link in bio" or similar
- Generate ${request.hookCount || 5} hook variations

Return ONLY this JSON:
{
  "hook": "primary hook",
  "body": "script body",
  "cta": "call to action",
  "fullScript": "complete script",
  "hookVariations": ["var1", "var2", "var3", "var4", "var5"],
  "estimatedDuration": 45
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')
  return JSON.parse(content) as ScriptGenerationResponse
}

export async function generateHookVariationsWithOpenAI(
  niche: string,
  offer: string,
  existingHook: string,
  count: number = 10,
  apiKey?: string
): Promise<string[]> {
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Generate ${count} hook variations for UGC content:
Niche: ${niche}
Offer: ${offer}
Base: "${existingHook}"

Rules: under 15 words each, mix curiosity/pain/social proof, conversational tone.

Return ONLY a JSON array: ["hook1", "hook2", ...]`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')
  const parsed = JSON.parse(content)
  return parsed.hooks || parsed
}

export async function generateCaptionAndHashtags(
  scriptContent: string,
  platform: string,
  niche: string,
  apiKey?: string
): Promise<{ caption: string; hashtags: string[] }> {
  const client = getClient(apiKey)

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Write an optimized ${platform} caption and hashtags for this UGC video in the ${niche} niche.

Script: "${scriptContent}"

Requirements:
- Caption: 1-3 sentences max, conversational, include a soft CTA
- Hashtags: 15-20 relevant tags mixing large and niche-specific
- Optimize for ${platform}'s algorithm

Return ONLY JSON:
{
  "caption": "caption text here",
  "hashtags": ["tag1", "tag2", ...]
}`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')
  return JSON.parse(content)
}
