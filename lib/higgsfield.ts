import axios from 'axios'
import { HiggsfieldVideoRequest, HiggsfieldVideoResponse, VideoStatus } from '@/types'

const HIGGSFIELD_BASE_URL = 'https://api.higgsfield.ai'

function getHeaders(apiKey?: string) {
  const key = apiKey || process.env.HIGGSFIELD_API_KEY
  if (!key) throw new Error('Higgsfield API key is required')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export async function createHiggsfieldVideo(
  request: HiggsfieldVideoRequest,
  apiKey?: string
): Promise<HiggsfieldVideoResponse> {
  const payload = {
    prompt: request.prompt,
    style: request.style || 'realistic',
    duration: request.duration || 6,
    aspect_ratio: request.aspectRatio || '9:16',
    quality: 'high',
  }

  const response = await axios.post(`${HIGGSFIELD_BASE_URL}/v1/video/generate`, payload, {
    headers: getHeaders(apiKey),
  })

  const jobId = response.data?.job_id || response.data?.id
  if (!jobId) throw new Error('Failed to create Higgsfield video: no job_id returned')

  return { jobId, status: 'generating' }
}

export async function getHiggsfieldVideoStatus(
  jobId: string,
  apiKey?: string
): Promise<HiggsfieldVideoResponse> {
  const response = await axios.get(`${HIGGSFIELD_BASE_URL}/v1/video/${jobId}`, {
    headers: getHeaders(apiKey),
  })

  const data = response.data
  const statusMap: Record<string, VideoStatus> = {
    queued: 'generating',
    running: 'processing',
    succeeded: 'ready',
    failed: 'failed',
  }

  return {
    jobId,
    status: statusMap[data.status] || 'generating',
    videoUrl: data.output?.url || data.video_url,
    thumbnailUrl: data.thumbnail_url,
  }
}

export async function listHiggsfieldStyles(apiKey?: string): Promise<Array<{ id: string; name: string; description: string }>> {
  try {
    const response = await axios.get(`${HIGGSFIELD_BASE_URL}/v1/styles`, {
      headers: getHeaders(apiKey),
    })
    return response.data?.styles || []
  } catch {
    return [
      { id: 'realistic', name: 'Realistic', description: 'Photorealistic video generation' },
      { id: 'cinematic', name: 'Cinematic', description: 'Film-quality cinematic style' },
      { id: 'animated', name: 'Animated', description: 'Animated video style' },
      { id: 'documentary', name: 'Documentary', description: 'Documentary-style footage' },
    ]
  }
}
