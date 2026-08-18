import { listChannelVideos, resolveChannel } from './youtube.ts'

export interface ApiResult {
  status: number
  body: unknown
}

export async function dispatchApi(method: string, url: URL): Promise<ApiResult> {
  if (method !== 'GET') {
    return { status: 405, body: { error: 'Method not allowed' } }
  }

  const channelVideos = url.pathname.match(/^\/api\/channel\/([^/]+)\/videos$/)
  if (channelVideos) {
    const channelId = decodeURIComponent(channelVideos[1])
    const videos = await listChannelVideos(channelId)
    return { status: 200, body: { videos } }
  }

  if (url.pathname === '/api/channel' || url.pathname === '/api/channel/') {
    const query = url.searchParams.get('q')?.trim()
    const channelId = url.searchParams.get('id')?.trim()
    const wantVideos = url.searchParams.get('videos') === '1'

    if (channelId && (wantVideos || !query)) {
      const videos = await listChannelVideos(channelId)
      return { status: 200, body: { videos } }
    }

    if (!query) {
      return { status: 400, body: { error: 'Missing channel URL or handle' } }
    }
    const channel = await resolveChannel(query)
    if (wantVideos) {
      const videos = await listChannelVideos(channel.id)
      return { status: 200, body: { ...channel, videos } }
    }
    return { status: 200, body: channel }
  }

  return { status: 404, body: { error: 'Not found' } }
}
