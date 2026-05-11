import { NextRequest, NextResponse } from 'next/server'
import { createHeyGenVideo, getHeyGenVideoStatus, listHeyGenAvatars, listHeyGenVoices } from '@/lib/heygen'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const apiKey = searchParams.get('apiKey') || undefined

  try {
    if (action === 'avatars') {
      const avatars = await listHeyGenAvatars(apiKey)
      return NextResponse.json({ avatars })
    }
    if (action === 'voices') {
      const voices = await listHeyGenVoices(apiKey)
      return NextResponse.json({ voices })
    }
    if (action === 'status') {
      const videoId = searchParams.get('videoId')
      if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })
      const status = await getHeyGenVideoStatus(videoId, apiKey)
      return NextResponse.json(status)
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HeyGen API error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, ...request } = body

    if (!request.avatarId || !request.script) {
      return NextResponse.json({ error: 'avatarId and script are required' }, { status: 400 })
    }

    const result = await createHeyGenVideo(request, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HeyGen video creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
