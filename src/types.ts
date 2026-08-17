export type Language = string

export interface LanguageMeta {
  id: Language
  code: string
  flag: string
  label: string
}

export interface Channel {
  id: string
  handle: string
  name: string
  thumbnailUrl: string
  subscriberCount?: string
  language: Language
  addedAt: string
}

export interface Video {
  id: string
  channelId: string
  title: string
  thumbnailUrl: string
  duration: string
  publishedAt: string
}

export interface LibraryState {
  channels: Channel[]
  videos: Video[]
  savedVideoIds: string[]
  customLanguages: LanguageMeta[]
}

export interface ChannelPreview {
  id: string
  handle: string
  name: string
  thumbnailUrl: string
  subscriberCount?: string
}

export interface DefaultTeacher {
  handle: string
  name: string
  language: Language
}
