import { useMemo, useState } from 'react'
import { AddChannelModal } from './components/AddChannelModal'
import { AddLanguageModal } from './components/AddLanguageModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { LanguageTabs } from './components/LanguageTabs'
import { Sidebar } from './components/Sidebar'
import { TvFrame } from './components/TvFrame'
import { VideoCard } from './components/VideoCard'
import { VideoGrid } from './components/VideoGrid'
import { VideoPlayerModal } from './components/VideoPlayerModal'
import { DEFAULT_TEACHERS } from './data/defaultChannels'
import { languageMeta, mergeLanguages } from './data/languages'
import { useLibrary } from './hooks/useLibrary'
import { fetchChannelVideos, fetchTeacher } from './lib/api'
import type { Channel, ChannelPreview, Language, Video } from './types'

const BATCH_SIZE = 1

export default function App() {
  const library = useLibrary()
  const [language, setLanguage] = useState<Language>('french')
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addLanguageOpen, setAddLanguageOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [playing, setPlaying] = useState<Video | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Channel | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const languages = useMemo(
    () => mergeLanguages(library.customLanguages),
    [library.customLanguages],
  )
  const videos = library.visibleVideos(language, query)
  const languageCounts = library.channels.reduce<Record<string, number>>((counts, channel) => {
    counts[channel.language] = (counts[channel.language] ?? 0) + 1
    return counts
  }, {})

  async function addFromPreview(preview: ChannelPreview, selectedLanguage: Language) {
    const videosForChannel = await fetchChannelVideos(preview.id)
    library.addChannel(
      {
        ...preview,
        language: selectedLanguage,
        addedAt: new Date().toISOString(),
      },
      videosForChannel,
    )
    setLanguage(selectedLanguage)
  }

  async function refreshAll() {
    if (library.channels.length === 0) return
    setRefreshing(true)
    setStatus(null)
    try {
      const incoming: Video[] = []
      for (const [index, channel] of library.channels.entries()) {
        setProgress(`REFRESH ${index + 1}/${library.channels.length}`)
        try {
          const latest = await fetchChannelVideos(channel.id)
          incoming.push(...latest)
        } catch {
          // Keep going so one bad channel does not block the rest.
        }
      }
      library.mergeVideos(incoming)
    } finally {
      setRefreshing(false)
      setProgress(null)
    }
  }

  async function loadTeachers() {
    const existing = new Set(
      library.channels.map((channel) => channel.handle.toLowerCase()),
    )
    const pending = DEFAULT_TEACHERS.filter(
      (teacher) => !existing.has(teacher.handle.toLowerCase()),
    )
    if (pending.length === 0) {
      setStatus('Those teachers are already in your library.')
      return
    }

    setLoadingTeachers(true)
    setStatus(null)
    let done = 0
    let failed = 0
    let lastError = ''
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (teacher) => {
          try {
            const preview = await fetchTeacher(teacher.handle)
            library.addChannel(
              {
                id: preview.id,
                handle: teacher.handle,
                name: preview.name,
                thumbnailUrl: preview.thumbnailUrl,
                subscriberCount: preview.subscriberCount,
                language: teacher.language,
                addedAt: new Date().toISOString(),
              },
              preview.videos,
            )
          } catch (error) {
            failed += 1
            lastError = error instanceof Error ? error.message : 'Fetch failed'
          } finally {
            done += 1
            setProgress(`LOADING ${done}/${pending.length}`)
          }
        }),
      )
    }
    setLoadingTeachers(false)
    setProgress(null)
    setStatus(
      failed
        ? `Loaded ${pending.length - failed} teachers. ${failed} could not be fetched${lastError ? `: ${lastError}` : '.'}`
        : `Loaded ${pending.length} teachers. Click a language tab to see each one.`,
    )
  }

  const emptyLibrary = library.channels.length === 0
  const missingTeachers = DEFAULT_TEACHERS.some(
    (teacher) =>
      !library.channels.some((channel) => channel.handle.toLowerCase() === teacher.handle.toLowerCase()),
  )

  return (
    <div className="room-bg min-h-svh px-3 py-12 md:px-6 md:py-16">
      <div className="mx-auto mb-8 flex max-w-6xl items-end justify-between gap-4">
        <div className="h-16 w-10 border-4 border-ink bg-card" />
        <div className="hidden h-20 w-16 border-4 border-ink bg-[#2d6b3a] sm:block" />
      </div>

      <TvFrame>
        <div className="flex h-full min-h-0 flex-col">
          <Header
            query={query}
            onQueryChange={setQuery}
            onRefresh={refreshAll}
            onAdd={() => setAddOpen(true)}
            onOpenLibrary={() => setLibraryOpen(true)}
            onLoadTeachers={loadTeachers}
            refreshing={refreshing}
            loadingTeachers={loadingTeachers}
            showLoadTeachers={missingTeachers}
          />
          <LanguageTabs
            languages={languages}
            value={language}
            onChange={setLanguage}
            onAddLanguage={() => setAddLanguageOpen(true)}
          />

          {status ? (
            <p className="border-b-4 border-purple-dark bg-ink px-3 py-2 text-[8px] leading-relaxed text-purple-pale">
              {status}
            </p>
          ) : null}

          {progress && (refreshing || loadingTeachers) ? (
            <p className="border-b-4 border-purple-dark bg-ink px-3 py-2 text-[8px] text-purple-pale">
              {progress}
            </p>
          ) : null}

          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-y-auto">
              {emptyLibrary ? (
                <EmptyState
                  onAdd={() => setAddOpen(true)}
                  onLoadTeachers={loadTeachers}
                  loadingTeachers={loadingTeachers}
                  progress={progress}
                />
              ) : videos.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-[10px] leading-relaxed text-purple-pale">
                    {languageCounts[language]
                      ? `${languageCounts[language]} ${languageMeta(language, languages).label} teachers loaded. No videos yet.`
                      : `No ${languageMeta(language, languages).label} videos${query ? ' match this search.' : ' yet.'}`}
                  </p>
                  {missingTeachers && !loadingTeachers ? (
                    <button type="button" className="pixel-btn" onClick={loadTeachers}>
                      LOAD MY TEACHERS
                    </button>
                  ) : null}
                </div>
              ) : (
                <VideoGrid>
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      channel={library.channelById(video.channelId)}
                      saved={library.savedVideoIds.includes(video.id)}
                      onWatch={setPlaying}
                      onToggleSave={library.toggleSave}
                    />
                  ))}
                </VideoGrid>
              )}
            </main>
            <Sidebar
              open={libraryOpen}
              languages={languages}
              savedVideos={library.savedVideos}
              channels={library.channels}
              onClose={() => setLibraryOpen(false)}
              onWatch={(video) => {
                setPlaying(video)
                setLibraryOpen(false)
              }}
              onRemoveChannel={setRemoveTarget}
            />
          </div>

          <div className="flex gap-2 border-t-4 border-purple-dark bg-card p-2 md:hidden">
            {missingTeachers ? (
              <button
                type="button"
                className="pixel-btn flex-1"
                onClick={loadTeachers}
                disabled={loadingTeachers}
              >
                {loadingTeachers ? 'LOADING' : 'TEACHERS'}
              </button>
            ) : null}
            <button
              type="button"
              className="pixel-btn flex-1"
              onClick={refreshAll}
              disabled={refreshing || emptyLibrary}
            >
              REFRESH
            </button>
          </div>
        </div>
      </TvFrame>

      <div className="wood-shelf mx-auto mt-0 h-8 max-w-6xl" />
      <div className="mx-auto mt-3 flex max-w-6xl justify-center">
        <div className="h-3 w-28 border-2 border-ink bg-card" />
      </div>

      <AddChannelModal
        open={addOpen}
        languages={languages}
        defaultLanguage={language}
        onClose={() => setAddOpen(false)}
        onAdd={addFromPreview}
      />

      <AddLanguageModal
        open={addLanguageOpen}
        existing={languages}
        onClose={() => setAddLanguageOpen(false)}
        onAdd={(next) => {
          library.addLanguage(next)
          setLanguage(next.id)
        }}
      />

      {playing ? (
        <VideoPlayerModal
          video={playing}
          channel={library.channelById(playing.channelId)}
          onClose={() => setPlaying(null)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="REMOVE CHANNEL?"
        message={
          removeTarget
            ? `Are you sure you want to remove ${removeTarget.name}? All of their videos will disappear too.`
            : ''
        }
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) library.removeChannel(removeTarget.id)
          setRemoveTarget(null)
        }}
      />
    </div>
  )
}
