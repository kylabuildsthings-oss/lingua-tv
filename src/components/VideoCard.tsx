import type { Channel, Video } from '../types'

interface VideoCardProps {
  video: Video
  channel?: Channel
  saved: boolean
  onWatch: (video: Video) => void
  onToggleSave: (videoId: string) => void
}

export function VideoCard({
  video,
  channel,
  saved,
  onWatch,
  onToggleSave,
}: VideoCardProps) {
  return (
    <article className="flex flex-col border-4 border-purple-dark bg-card">
      <div className="relative aspect-video overflow-hidden border-b-4 border-purple-dark bg-ink">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[8px] text-purple-light">
            NO IMAGE
          </div>
        )}
        {video.duration ? (
          <span className="absolute bottom-2 right-2 bg-ink px-2 py-1 text-[8px] text-white">
            {video.duration}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h2 className="line-clamp-3 text-[10px] leading-relaxed text-white">
          {video.title}
        </h2>
        <p className="text-[8px] leading-relaxed text-purple-light">
          {channel?.name ?? 'Unknown channel'}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            className="text-[14px] leading-none"
            onClick={() => onToggleSave(video.id)}
            aria-label={saved ? 'Unsave video' : 'Save video'}
          >
            {saved ? '♥' : '♡'}
          </button>
          <button type="button" className="pixel-btn" onClick={() => onWatch(video)}>
            WATCH
          </button>
        </div>
      </div>
    </article>
  )
}
