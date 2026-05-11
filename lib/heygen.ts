import axios from 'axios'
import { HeyGenAvatar, HeyGenVideoRequest, HeyGenVideoResponse, VideoStatus } from '@/types'

const HEYGEN_BASE_URL = 'https://api.heygen.com'

function getHeaders(apiKey?: string) {
  const key = apiKey || process.env.HEYGEN_API_KEY
  if (!key) throw new Error('HeyGen API key is required')
  return {
    'X-Api-Key': key,
    'Content-Type': 'application/json',
  }
}

export async function listHeyGenAvatars(apiKey?: string): Promise<HeyGenAvatar[]> {
  const response = await axios.get(`${HEYGEN_BASE_URL}/v2/avatars`, {
    headers: getHeaders(apiKey),
  })

  const data = response.data
  if (!data?.data?.avatars) return []

  return data.data.avatars.map((a: Record<string, string>) => ({
    avatarId: a.avatar_id,
    avatarName: a.avatar_name,
    gender: a.gender || 'unknown',
    previewImageUrl: a.preview_image_url || '',
    previewVideoUrl: a.preview_video_url,
  }))
}

export async function createHeyGenVideo(
  request: HeyGenVideoRequest,
  apiKey?: string
): Promise<HeyGenVideoResponse> {
  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: request.avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: request.script,
          voice_id: request.voiceId || 'en-US-AriaNeural',
          speed: 1.0,
        },
        background: request.background
          ? { type: 'color', value: request.background }
          : { type: 'color', value: '#FFFFFF' },
      },
    ],
    dimension: request.dimension || { width: 720, height: 1280 },
    aspect_ratio: '9:16',
    test: false,
  }

  const response = await axios.post(`${HEYGEN_BASE_URL}/v2/video/generate`, payload, {
    headers: getHeaders(apiKey),
  })

  const videoId = response.data?.data?.video_id
  if (!videoId) throw new Error('Failed to create HeyGen video: no video_id returned')

  return { videoId, status: 'generating' }
}

export async function getHeyGenVideoStatus(
  videoId: string,
  apiKey?: string
): Promise<HeyGenVideoResponse> {
  const response = await axios.get(`${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
    headers: getHeaders(apiKey),
  })

  const data = response.data?.data
  if (!data) throw new Error('Failed to get video status')

  const statusMap: Record<string, VideoStatus> = {
    pending: 'generating',
    processing: 'processing',
    completed: 'ready',
    failed: 'failed',
  }

  return {
    videoId,
    status: statusMap[data.status] || 'generating',
    videoUrl: data.video_url,
  }
}

export async function listHeyGenVoices(apiKey?: string): Promise<Array<{ voiceId: string; name: string; language: string }>> {
  const response = await axios.get(`${HEYGEN_BASE_URL}/v2/voices`, {
    headers: getHeaders(apiKey),
  })

  const voices = response.data?.data?.voices || []
  return voices
    .filter((v: Record<string, string>) => v.language === 'en-US')
    .slice(0, 20)
    .map((v: Record<string, string>) => ({
      voiceId: v.voice_id,
      name: v.display_name,
      language: v.language,
    }))
}
