import type { ChannelPreview, Video } from '../types'

const FETCH_TIMEOUT_MS = 30_000

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      'The YouTube lookup API is missing on this host. Redeploy with the serverless /api routes.',
    )
  }
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return data
}

async function get(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
}

export async function lookupChannel(query: string): Promise<ChannelPreview> {
  const params = new URLSearchParams({ q: query })
  const response = await get(`/api/channel?${params}`)
  return readJson<ChannelPreview>(response)
}

export async function fetchChannelVideos(channelId: string): Promise<Video[]> {
  const response = await get(`/api/channel/${encodeURIComponent(channelId)}/videos`)
  const data = await readJson<{ videos: Video[] }>(response)
  return data.videos
}

export async function fetchTeacher(
  query: string,
): Promise<ChannelPreview & { videos: Video[] }> {
  const params = new URLSearchParams({ q: query, videos: '1' })
  const response = await get(`/api/channel?${params}`)
  const data = await readJson<ChannelPreview & { videos?: Video[] }>(response)
  return { ...data, videos: data.videos ?? [] }
}
