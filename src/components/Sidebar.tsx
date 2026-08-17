import type { Channel, LanguageMeta, Video } from '../types'

interface SidebarProps {
  open: boolean
  languages: LanguageMeta[]
  savedVideos: Video[]
  channels: Channel[]
  onClose: () => void
  onWatch: (video: Video) => void
  onRemoveChannel: (channel: Channel) => void
}

export function Sidebar({
  open,
  languages,
  savedVideos,
  channels,
  onClose,
  onWatch,
  onRemoveChannel,
}: SidebarProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/70 lg:hidden"
          aria-label="Close library"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto border-t-4 border-purple-dark bg-card p-3 lg:static lg:z-0 lg:h-full lg:max-h-full lg:w-72 lg:shrink-0 lg:border-l-4 lg:border-t-0 ${
          open ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <h2 className="text-[10px] text-white">LIBRARY</h2>
          <button type="button" className="pixel-btn" onClick={onClose}>
            X
          </button>
        </div>

        <section className="mb-5">
          <h2 className="mb-3 border-b-2 border-purple-mid pb-2 text-[10px] text-purple-pale">
            SAVED VIDEOS
          </h2>
          {savedVideos.length === 0 ? (
            <p className="text-[8px] leading-relaxed text-purple-light">No saved videos yet.</p>
          ) : (
            <ul className="space-y-2">
              {savedVideos.map((video) => (
                <li key={video.id} className="flex gap-2 border-2 border-purple-dark p-1">
                  <img src={video.thumbnailUrl} alt="" className="h-10 w-14 object-cover" />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left text-[8px] leading-relaxed text-white"
                    onClick={() => onWatch(video)}
                  >
                    <span className="line-clamp-2">{video.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 border-b-2 border-purple-mid pb-2 text-[10px] text-purple-pale">
            CHANNELS
          </h2>
          {channels.length === 0 ? (
            <p className="text-[8px] leading-relaxed text-purple-light">No channels yet.</p>
          ) : (
            languages.map((language) => {
              const group = channels.filter((channel) => channel.language === language.id)
              if (group.length === 0) return null
              return (
                <div key={language.id} className="mb-4">
                  <h3 className="mb-2 text-[8px] text-purple-light">
                    {language.flag} {language.label}
                  </h3>
                  <ul className="space-y-2">
                    {group.map((channel) => (
                      <li
                        key={channel.id}
                        className="flex items-center gap-2 border-2 border-purple-dark p-1"
                      >
                        {channel.thumbnailUrl ? (
                          <img
                            src={channel.thumbnailUrl}
                            alt=""
                            className="h-8 w-8 object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-purple-dark" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[8px] text-white">{channel.name}</p>
                          <p className="truncate text-[8px] text-purple-light">{channel.handle}</p>
                        </div>
                        <button
                          type="button"
                          className="pixel-btn px-2 py-1"
                          onClick={() => onRemoveChannel(channel)}
                          aria-label={`Remove ${channel.name}`}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </section>
      </aside>
    </>
  )
}
