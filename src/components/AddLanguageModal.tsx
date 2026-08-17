import { useEffect, useState } from 'react'
import { slugifyLanguage } from '../data/languages'
import type { LanguageMeta } from '../types'

interface AddLanguageModalProps {
  open: boolean
  existing: LanguageMeta[]
  onClose: () => void
  onAdd: (language: LanguageMeta) => void
}

export function AddLanguageModal({ open, existing, onClose, onAdd }: AddLanguageModalProps) {
  const [label, setLabel] = useState('')
  const [code, setCode] = useState('')
  const [flag, setFlag] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setLabel('')
      setCode('')
      setFlag('')
      setError(null)
    }
  }, [open])

  if (!open) return null

  function handleAdd() {
    const trimmedLabel = label.trim()
    const trimmedCode = code.trim().toUpperCase().slice(0, 2)
    const id = slugifyLanguage(trimmedLabel)

    if (trimmedLabel.length < 2) {
      setError('Enter a language name.')
      return
    }
    if (!/^[A-Z]{2}$/.test(trimmedCode)) {
      setError('Tab code must be 2 letters, like JP.')
      return
    }
    if (existing.some((item) => item.id === id || item.code === trimmedCode)) {
      setError('That language or tab code is already there.')
      return
    }

    onAdd({
      id,
      code: trimmedCode,
      flag: flag.trim() || '🏳️',
      label: trimmedLabel,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="pixel-border w-full max-w-md bg-card p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[12px] leading-relaxed text-white">ADD LANGUAGE TAB</h2>
          <button type="button" className="pixel-btn px-2 py-1" onClick={onClose}>
            X
          </button>
        </div>

        <label className="mb-3 block text-[8px] leading-relaxed text-purple-pale">
          LANGUAGE NAME
          <input
            className="pixel-input mt-2"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Japanese"
          />
        </label>

        <label className="mb-3 block text-[8px] leading-relaxed text-purple-pale">
          TAB CODE
          <input
            className="pixel-input mt-2 uppercase"
            value={code}
            maxLength={2}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="JP"
          />
        </label>

        <label className="mb-4 block text-[8px] leading-relaxed text-purple-pale">
          FLAG EMOJI
          <input
            className="pixel-input mt-2"
            value={flag}
            onChange={(event) => setFlag(event.target.value)}
            placeholder="🇯🇵"
          />
        </label>

        {error ? <p className="mb-3 text-[8px] leading-relaxed text-purple-pale">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button type="button" className="pixel-btn bg-purple-mid" onClick={onClose}>
            CANCEL
          </button>
          <button type="button" className="pixel-btn" onClick={handleAdd}>
            ADD
          </button>
        </div>
      </div>
    </div>
  )
}
