import type { ReactNode } from 'react'

interface VideoGridProps {
  children: ReactNode
}

export function VideoGrid({ children }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}
