interface EmptyStateProps {
  onAdd: () => void
  onLoadTeachers: () => void
  loadingTeachers: boolean
  progress?: string | null
}

export function EmptyState({
  onAdd,
  onLoadTeachers,
  loadingTeachers,
  progress,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <p className="text-[12px] leading-relaxed text-purple-pale">NO VIDEOS YET</p>
      <p className="max-w-md text-[8px] leading-relaxed text-purple-light">
        Add a language teacher or load your saved list of 53 channels.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="pixel-btn" onClick={onAdd} disabled={loadingTeachers}>
          ADD YOUR FIRST CHANNEL
        </button>
        <button
          type="button"
          className="pixel-btn bg-purple-mid"
          onClick={onLoadTeachers}
          disabled={loadingTeachers}
        >
          {loadingTeachers ? progress || 'LOADING...' : 'LOAD MY TEACHERS'}
        </button>
      </div>
    </div>
  )
}
