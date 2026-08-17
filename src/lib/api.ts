import type { ChannelPreview, Video } from '../types'

const FETCH_TIMEOUT_MS = 30_000

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }
  return data
}

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  return response
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
