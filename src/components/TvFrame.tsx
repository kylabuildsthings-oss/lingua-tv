import type { ReactNode } from 'react'

interface TvFrameProps {
  children: ReactNode
  compact?: boolean
}

export function TvFrame({ children, compact = false }: TvFrameProps) {
  return (
    <div className={`relative mx-auto w-full ${compact ? 'max-w-4xl' : 'max-w-6xl'}`}>
      <div className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-end gap-16">
        <div className="h-8 w-1 rotate-[-28deg] bg-ink" />
        <div className="mb-1 h-3 w-3 bg-purple-mid" />
        <div className="h-8 w-1 rotate-[28deg] bg-ink" />
      </div>

      <div className="tv-glow bg-purple-dark p-3">
        <div className="border-4 border-purple-mid bg-card p-2">
          <div className="relative h-[min(74vh,760px)] min-h-[420px] overflow-hidden border-4 border-ink bg-bg">
            <div className="scanlines absolute inset-0 z-20" />
            <div className="relative z-10 h-full overflow-hidden">{children}</div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 px-2 py-1">
            <div className="flex gap-3">
              <div className="h-6 w-6 border-2 border-ink bg-purple-light" />
              <div className="h-6 w-6 border-2 border-ink bg-purple-pale" />
              <div className="h-6 w-6 border-2 border-ink bg-purple-mid" />
              <div className="h-6 w-6 border-2 border-ink bg-purple-dark" />
            </div>
            <div className="grid h-8 w-28 grid-cols-8 grid-rows-3 gap-px bg-ink p-px">
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className="bg-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
