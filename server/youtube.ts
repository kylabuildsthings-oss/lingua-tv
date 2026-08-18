import type { ChannelPreview, Video } from '../src/types'

const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: YT_HEADERS, redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`YouTube request failed (${response.status})`)
  }
  return response.text()
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function metaContent(html: string, property: string): string {
  const match =
    html.match(new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]+)"`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${property}"`, 'i'))
  return match?.[1] ?? ''
}

function normalizeInput(raw: string): { url: string; handle: string; channelId?: string } {
  const trimmed = raw.trim()
  const channelIdMatch = trimmed.match(/(UC[\w-]{20,})/)
  const handleMatch = trimmed.match(/@[\w.-]+/)
  const handle =
    handleMatch?.[0] ??
    (trimmed.startsWith('@')
      ? trimmed
      : `@${trimmed.replace(/^https?:\/\/(www\.)?youtube\.com\/@?/i, '')}`)

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

export async function resolveChannel(query: string): Promise<ChannelPreview> {
  const input = normalizeInput(query)
  let channelId = input.channelId
  let html = ''

  if (!channelId) {
    html = await fetchText(input.url)
    if (/consent\.youtube\.com|Before you continue to YouTube/i.test(html)) {
      throw new Error('YouTube blocked this server. Try again later.')
    }
    channelId =
      html.match(/https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)/)?.[1] ||
      html.match(/"externalId":"(UC[\w-]+)"/)?.[1] ||
      html.match(/"channelId":"(UC[\w-]+)"/)?.[1]
  }

  if (!channelId) {
    throw new Error('Could not find that YouTube channel')
  }

  if (!html) {
    try {
      html = await fetchText(`https://www.youtube.com/channel/${channelId}`)
    } catch {
      html = ''
    }
  }

  const name =
    metaContent(html, 'og:title').replace(/ - YouTube$/, '') ||
    html.match(/"title":"([^"]+)"/)?.[1] ||
    input.handle.replace(/^@/, '')
  const thumbnailUrl = metaContent(html, 'og:image')
  const handleFromPage =
    html.match(/"vanityChannelUrl":"https?:\/\/(?:www\.)?youtube\.com\/(@[\w.-]+)"/)?.[1] ||
    input.handle

  return {
    id: channelId,
    handle: handleFromPage.startsWith('@') ? handleFromPage : `@${handleFromPage}`,
    name,
    thumbnailUrl,
  }
}

export async function listChannelVideos(channelId: string): Promise<Video[]> {
  const xml = await fetchText(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
  )
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
  return entries.slice(0, 30).flatMap((match) => {
    const entry = match[1]
    const id =
      entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ||
      entry.match(/<id>yt:video:([^<]+)<\/id>/)?.[1]
    if (!id) return []
    const title = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? 'Untitled')
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? new Date().toISOString()
    const thumbnailUrl =
      entry.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    return [
      {
        id,
        channelId,
        title,
        thumbnailUrl,
        duration: '',
        publishedAt,
      },
    ]
  })
}
