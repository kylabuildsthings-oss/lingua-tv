import type { ChannelPreview, Video } from '../types'

const FETCH_TIMEOUT_MS = 30_000

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  const raw = await response.text()
  if (!contentType.includes('application/json')) {
    throw new Error(raw.slice(0, 180).trim() || `Lookup failed (${response.status})`)
  }
  const data = JSON.parse(raw) as T & { error?: string }
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
  const params = new URLSearchParams({ id: channelId, videos: '1' })
  const response = await get(`/api/channel?${params}`)
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
