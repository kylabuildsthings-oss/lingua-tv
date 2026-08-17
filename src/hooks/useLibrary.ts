import { useCallback, useMemo, useState } from 'react'
import { loadLibrary, saveLibrary } from '../lib/storage'
import type { Channel, Language, LanguageMeta, LibraryState, Video } from '../types'

function commit(next: LibraryState): LibraryState {
  saveLibrary(next)
  return next
}

export function useLibrary() {
  const [state, setState] = useState<LibraryState>(() => loadLibrary())

  const addChannel = useCallback((channel: Channel, videos: Video[]) => {
    setState((prev) => {
      const channels = [...prev.channels.filter((item) => item.id !== channel.id), channel]
      const existingIds = new Set(prev.videos.map((item) => item.id))
      const mergedVideos = [
        ...videos.filter((item) => !existingIds.has(item.id)),
        ...prev.videos,
      ]
      return commit({ ...prev, channels, videos: mergedVideos })
    })
  }, [])

  const removeChannel = useCallback((channelId: string) => {
    setState((prev) =>
      commit({
        ...prev,
        channels: prev.channels.filter((item) => item.id !== channelId),
        videos: prev.videos.filter((item) => item.channelId !== channelId),
        savedVideoIds: prev.savedVideoIds.filter((id) => {
          const video = prev.videos.find((item) => item.id === id)
          return video?.channelId !== channelId
        }),
      }),
    )
  }, [])

  const mergeVideos = useCallback((incoming: Video[]) => {
    setState((prev) => {
      const byId = new Map(prev.videos.map((item) => [item.id, item]))
      for (const video of incoming) {
        byId.set(video.id, video)
      }
      return commit({ ...prev, videos: [...byId.values()] })
    })
  }, [])

  const toggleSave = useCallback((videoId: string) => {
    setState((prev) => {
      const savedVideoIds = prev.savedVideoIds.includes(videoId)
        ? prev.savedVideoIds.filter((id) => id !== videoId)
        : [...prev.savedVideoIds, videoId]
      return commit({ ...prev, savedVideoIds })
    })
  }, [])

  const addLanguage = useCallback((language: LanguageMeta) => {
    setState((prev) => {
      const exists = prev.customLanguages.some(
        (item) => item.id === language.id || item.code === language.code,
      )
      if (exists) return prev
      return commit({
        ...prev,
        customLanguages: [...prev.customLanguages, language],
      })
    })
  }, [])

  const visibleVideos = useCallback(
    (language: Language, query: string) => {
      const q = query.trim().toLowerCase()
      return state.videos
        .filter((video) => {
          const channel = state.channels.find((item) => item.id === video.channelId)
          if (!channel || channel.language !== language) return false
          if (!q) return true
          return (
            video.title.toLowerCase().includes(q) ||
            channel.name.toLowerCase().includes(q) ||
            channel.handle.toLowerCase().includes(q)
          )
        })
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    },
    [state.channels, state.videos],
  )

  const savedVideos = useMemo(() => {
    return state.savedVideoIds
      .map((id) => state.videos.find((video) => video.id === id))
      .filter((video): video is Video => Boolean(video))
  }, [state.savedVideoIds, state.videos])

  const channelById = useCallback(
    (id: string) => state.channels.find((item) => item.id === id),
    [state.channels],
  )

  return {
    channels: state.channels,
    videos: state.videos,
    savedVideoIds: state.savedVideoIds,
    customLanguages: state.customLanguages,
    savedVideos,
    addChannel,
    removeChannel,
    mergeVideos,
    toggleSave,
    addLanguage,
    visibleVideos,
    channelById,
  }
}
