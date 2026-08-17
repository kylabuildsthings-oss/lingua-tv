import { TvFrame } from './TvFrame'
import type { Channel, Video } from '../types'

interface VideoPlayerModalProps {
  video: Video
  channel?: Channel
  onClose: () => void
}

export function VideoPlayerModal({ video, channel, onClose }: VideoPlayerModalProps) {
  const src = `https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4">
      <div className="w-full max-w-4xl">
        <TvFrame compact>
          <div className="flex items-start justify-between gap-3 border-b-4 border-purple-dark bg-card p-3">
            <div className="min-w-0">
              <p className="line-clamp-2 text-[10px] leading-relaxed text-white">{video.title}</p>
              <p className="mt-1 text-[8px] text-purple-light">{channel?.name}</p>
            </div>
            <button type="button" className="pixel-btn px-2 py-1" onClick={onClose}>
              X
            </button>
          </div>
          <div className="relative aspect-video bg-ink">
            <iframe
              title={video.title}
              src={src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="scanlines absolute inset-0 z-10" />
          </div>
        </TvFrame>
      </div>
    </div>
  )
}
