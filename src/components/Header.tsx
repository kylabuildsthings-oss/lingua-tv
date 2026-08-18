interface HeaderProps {
  query: string
  onQueryChange: (value: string) => void
  onRefresh: () => void
  onAdd: () => void
  onOpenLibrary: () => void
  onLoadTeachers?: () => void
  refreshing: boolean
  loadingTeachers?: boolean
  showLoadTeachers?: boolean
}

export function Header({
  query,
  onQueryChange,
  onRefresh,
  onAdd,
  onOpenLibrary,
  onLoadTeachers,
  refreshing,
  loadingTeachers = false,
  showLoadTeachers = false,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b-4 border-purple-dark bg-card p-3 md:flex-row md:items-center">
      <div className="flex items-center justify-between gap-3 md:justify-start">
        <h1 className="flex items-center gap-2 text-[10px] leading-none text-white md:text-[14px]">
          LINGUA TV
        </h1>
        <div className="flex gap-2 md:hidden">
          <button type="button" className="pixel-btn" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? '...' : 'R'}
          </button>
          <button type="button" className="pixel-btn" onClick={onOpenLibrary}>
            LIB
          </button>
          <button type="button" className="pixel-btn" onClick={onAdd}>
            +
          </button>
        </div>
      </div>

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search videos</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-pale">
          ⌕
        </span>
        <input
          className="pixel-input pl-8 uppercase"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="SEARCH VIDEOS"
        />
      </label>

      <div className="hidden gap-2 md:flex">
        {showLoadTeachers && onLoadTeachers ? (
          <button
            type="button"
            className="pixel-btn"
            onClick={onLoadTeachers}
            disabled={loadingTeachers}
          >
            {loadingTeachers ? '...' : 'TEACHERS'}
          </button>
        ) : null}
        <button type="button" className="pixel-btn" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? '...' : 'REFRESH'}
        </button>
        <button type="button" className="pixel-btn" onClick={onAdd}>
          ADD
        </button>
      </div>
    </header>
  )
}
