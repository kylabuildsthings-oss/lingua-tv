import type { LibraryState } from '../types'

const STORAGE_KEY = 'linguatv.library.v1'

const EMPTY: LibraryState = {
  channels: [],
  videos: [],
  savedVideoIds: [],
  customLanguages: [],
}

export function loadLibrary(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<LibraryState>
    return {
      channels: Array.isArray(parsed.channels) ? parsed.channels : [],
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
      savedVideoIds: Array.isArray(parsed.savedVideoIds) ? parsed.savedVideoIds : [],
      customLanguages: Array.isArray(parsed.customLanguages) ? parsed.customLanguages : [],
    }
  } catch {
    return EMPTY
  }
}

export function saveLibrary(state: LibraryState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
