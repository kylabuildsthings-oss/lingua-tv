import { Innertube } from 'youtubei.js'
import type { ChannelPreview, Video } from '../src/types.ts'

let clientPromise: Promise<Innertube> | null = null
let youtubeQueue: Promise<void> = Promise.resolve()

function getClient(): Promise<Innertube> {
  if (!clientPromise) {
    clientPromise = Innertube.create().catch((error) => {
      clientPromise = null
      throw error
    })
  }
  return clientPromise
}

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = youtubeQueue.then(work, work)
  youtubeQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function asText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text
  }
  if (typeof value === 'object' && 'toString' in value) {
    return String(value)
  }
  return ''
}

function pickThumbnail(thumbs: unknown): string {
  if (!Array.isArray(thumbs) || thumbs.length === 0) return ''
  const last = thumbs[thumbs.length - 1] as { url?: string }
  return last?.url ?? ''
}

function relativeToIso(text?: string): string {
  if (!text) return new Date().toISOString()
  const parsed = Date.parse(text)
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()

  const match = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i)
  if (!match) return new Date().toISOString()

  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const ms: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  }
  return new Date(Date.now() - amount * (ms[unit] ?? 0)).toISOString()
}

function normalizeInput(raw: string): { url: string; handle: string; channelId?: string } {
  const trimmed = raw.trim()
  const channelIdMatch = trimmed.match(/(UC[\w-]{20,})/)
  const handleMatch = trimmed.match(/@[\w.-]+/)
  const handle = handleMatch?.[0] ?? (trimmed.startsWith('@') ? trimmed : `@${trimmed.replace(/^https?:\/\/(www\.)?youtube\.com\/@?/i, '')}`)

  if (channelIdMatch) {
    return {
      url: `https://www.youtube.com/channel/${channelIdMatch[1]}`,
      handle,
      channelId: channelIdMatch[1],
    }
  }

  if (trimmed.startsWith('http')) {
    return { url: trimmed, handle }
  }

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`
  return { url: `https://www.youtube.com/${cleanHandle}`, handle: cleanHandle }
}

function durationFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as { text?: string; seconds?: number }
    if (record.text) return record.text
    if (typeof record.seconds === 'number') {
      const minutes = Math.floor(record.seconds / 60)
      const seconds = record.seconds % 60
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    }
  }
  return ''
}

function overlayDuration(item: Record<string, unknown>): string {
  const image = item.content_image as { overlays?: { badges?: { text?: string }[] }[] } | undefined
  for (const overlay of image?.overlays ?? []) {
    for (const badge of overlay.badges ?? []) {
      if (badge.text && /^\d+:\d{2}(:\d{2})?$/.test(badge.text)) return badge.text
    }
  }
  return ''
}

function publishedFromMetadata(item: Record<string, unknown>): string {
  const metadata = item.metadata as {
    metadata?: { metadata_rows?: { metadata_parts?: { text?: { text?: string } }[] }[] }
  } | undefined
  for (const row of metadata?.metadata?.metadata_rows ?? []) {
    for (const part of row.metadata_parts ?? []) {
      const text = part.text?.text ?? ''
      if (/\bago\b/i.test(text)) return text
    }
  }
  return asText(item.published)
}

function mapVideo(item: Record<string, unknown>, channelId: string): Video | null {
  const type = String(item.type ?? '')
  const contentType = String(item.content_type ?? '')
  if (type.includes('Short') || contentType === 'SHORT' || contentType === 'PLAYLIST') {
    return null
  }

  const id =
    (typeof item.content_id === 'string' && item.content_id) ||
    (typeof item.video_id === 'string' && item.video_id) ||
    (typeof item.id === 'string' && item.id) ||
    ''
  if (!id || id.length < 8) return null

  const metadata = item.metadata as { title?: unknown } | undefined
  const title = asText(item.title) || asText(metadata?.title) || 'Untitled'
  const contentImage = item.content_image as { image?: unknown } | undefined
  const duration =
    durationFromUnknown(item.duration) || asText(item.length_text) || overlayDuration(item)

  return {
    id,
    channelId,
    title,
    thumbnailUrl:
      pickThumbnail(item.thumbnails) ||
      pickThumbnail(contentImage?.image) ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    duration,
    publishedAt: relativeToIso(publishedFromMetadata(item)),
  }
}

async function resolveChannelUnqueued(query: string): Promise<ChannelPreview> {
  const yt = await getClient()
  const input = normalizeInput(query)
  let channelId = input.channelId

  if (!channelId) {
    try {
      const endpoint = await yt.resolveURL(input.url)
      const browseId = endpoint.payload?.browseId as string | undefined
      if (browseId?.startsWith('UC')) channelId = browseId
    } catch {
      channelId = undefined
    }
  }

  if (!channelId) {
    const results = await yt.search(input.handle.replace(/^@/, ''), { type: 'channel' })
    const first = results.channels?.[0] as { id?: string; author?: { id?: string } } | undefined
    channelId = first?.id ?? first?.author?.id
  }

  if (!channelId) {
    throw new Error('Could not find that YouTube channel')
  }

  const channel = await yt.getChannel(channelId)
  const header = channel.header as
    | { subscribers?: { text?: string }; channel_handle?: { text?: string }; author?: { name?: string; thumbnails?: { url: string }[] } }
    | undefined

  const handle =
    asText(header?.channel_handle) ||
    input.handle ||
    channel.metadata.vanity_channel_url?.split('/').pop() ||
    `@${channel.metadata.title ?? 'channel'}`

  const thumbnailUrl =
    pickThumbnail(channel.metadata.avatar) ||
    pickThumbnail(channel.metadata.thumbnail) ||
    pickThumbnail(header?.author?.thumbnails)

  return {
    id: channel.metadata.external_id || channelId,
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    name: channel.metadata.title || header?.author?.name || 'YouTube Channel',
    thumbnailUrl,
    subscriberCount: asText(header?.subscribers) || undefined,
  }
}

export async function resolveChannel(query: string): Promise<ChannelPreview> {
  return enqueue(() => resolveChannelUnqueued(query))
}

async function listChannelVideosUnqueued(channelId: string): Promise<Video[]> {
  const yt = await getClient()
  const channel = await yt.getChannel(channelId)
  const feeds = [channel]
  if (channel.has_videos) {
    try {
      feeds.unshift(await channel.getVideos())
    } catch {
      // Fall back to the home feed if the videos tab fails.
    }
  }

  const mapped: Video[] = []
  const seen = new Set<string>()
  for (const feed of feeds) {
    for (const item of feed.videos) {
      const video = mapVideo(item as unknown as Record<string, unknown>, channelId)
      if (!video || seen.has(video.id)) continue
      seen.add(video.id)
      mapped.push(video)
    }
  }

  return mapped.slice(0, 30)
}

export async function listChannelVideos(channelId: string): Promise<Video[]> {
  return enqueue(() => listChannelVideosUnqueued(channelId))
}
