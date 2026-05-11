import { NextRequest, NextResponse } from 'next/server'
import { createHiggsfieldVideo, getHiggsfieldVideoStatus, listHiggsfieldStyles } from '@/lib/higgsfield'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const apiKey = searchParams.get('apiKey') || undefined

  try {
    if (action === 'styles') {
      const styles = await listHiggsfieldStyles(apiKey)
      return NextResponse.json({ styles })
    }
    if (action === 'status') {
      const jobId = searchParams.get('jobId')
      if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })
      const status = await getHiggsfieldVideoStatus(jobId, apiKey)
      return NextResponse.json(status)
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Higgsfield API error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, ...request } = body

    if (!request.prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const result = await createHiggsfieldVideo(request, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Higgsfield video creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
