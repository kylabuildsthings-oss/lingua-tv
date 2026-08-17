import { useEffect, useState } from 'react'
import { lookupChannel } from '../lib/api'
import type { ChannelPreview, Language, LanguageMeta } from '../types'

interface AddChannelModalProps {
  open: boolean
  languages: LanguageMeta[]
  defaultLanguage: Language
  onClose: () => void
  onAdd: (preview: ChannelPreview, language: Language) => Promise<void>
}

export function AddChannelModal({
  open,
  languages,
  defaultLanguage,
  onClose,
  onAdd,
}: AddChannelModalProps) {
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [preview, setPreview] = useState<ChannelPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setPreview(null)
      setError(null)
      setLookingUp(false)
      setAdding(false)
      setLanguage(defaultLanguage)
    }
  }, [open, defaultLanguage])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setPreview(null)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLookingUp(true)
      setError(null)
      try {
        const result = await lookupChannel(trimmed)
        if (!cancelled) setPreview(result)
      } catch (err) {
        if (!cancelled) {
          setPreview(null)
          setError(err instanceof Error ? err.message : 'Lookup failed')
        }
      } finally {
        if (!cancelled) setLookingUp(false)
      }
    }, 600)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, query])

  if (!open) return null

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setQuery(text.trim())
    } catch {
      setError('Could not read clipboard')
    }
  }

  async function handleAdd() {
    if (!preview) return
    setAdding(true)
    setError(null)
    try {
      await onAdd(preview, language)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add channel')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="pixel-border w-full max-w-xl bg-card p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[12px] leading-relaxed text-white">ADD YOUTUBE CHANNEL</h2>
          <button type="button" className="pixel-btn px-2 py-1" onClick={onClose}>
            X
          </button>
        </div>

        <label className="mb-3 block text-[8px] leading-relaxed text-purple-pale">
          YOUTUBE CHANNEL URL
          <div className="mt-2 flex gap-2">
            <input
              className="pixel-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Paste link here..."
            />
            <button type="button" className="pixel-btn shrink-0" onClick={pasteFromClipboard}>
              PASTE
            </button>
          </div>
        </label>

        <label className="mb-4 block text-[8px] leading-relaxed text-purple-pale">
          PREFERRED LANGUAGE
          <select
            className="pixel-input mt-2"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.flag} {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-4 border-4 border-purple-dark bg-bg p-3">
          <p className="mb-2 text-[8px] text-purple-pale">CHANNEL PREVIEW</p>
          {lookingUp ? (
            <p className="text-[8px] text-purple-light">Looking up...</p>
          ) : preview ? (
            <div className="flex items-center gap-3">
              {preview.thumbnailUrl ? (
                <img src={preview.thumbnailUrl} alt="" className="h-12 w-12 object-cover" />
              ) : (
                <div className="h-12 w-12 bg-purple-dark" />
              )}
              <div>
                <p className="text-[10px] text-white">{preview.name}</p>
                <p className="text-[8px] text-purple-light">{preview.handle}</p>
                {preview.subscriberCount ? (
                  <p className="text-[8px] text-purple-pale">{preview.subscriberCount}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-[8px] text-purple-light">Paste a handle or URL to preview.</p>
          )}
        </div>

        {error ? <p className="mb-3 text-[8px] leading-relaxed text-purple-pale">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button type="button" className="pixel-btn bg-purple-mid" onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className="pixel-btn"
            onClick={handleAdd}
            disabled={!preview || adding}
          >
            {adding ? 'ADDING...' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  )
}
