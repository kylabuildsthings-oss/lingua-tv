import type { Language, LanguageMeta } from '../types'

interface LanguageTabsProps {
  languages: LanguageMeta[]
  value: Language
  onChange: (language: Language) => void
  onAddLanguage: () => void
}

export function LanguageTabs({
  languages,
  value,
  onChange,
  onAddLanguage,
}: LanguageTabsProps) {
  return (
    <div className="flex overflow-x-auto border-b-4 border-purple-dark bg-bg">
      {languages.map((language) => {
        const active = language.id === value
        return (
          <button
            key={language.id}
            type="button"
            onClick={() => onChange(language.id)}
            className={`min-w-[72px] flex-1 border-r-4 border-purple-dark px-3 py-3 text-[10px] leading-none ${
              active ? 'bg-purple-dark text-white' : 'bg-purple-light text-ink'
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.code}
          </button>
        )
      })}
      <button
        type="button"
        onClick={onAddLanguage}
        className="min-w-[48px] border-r-4 border-purple-dark bg-purple-mid px-3 py-3 text-[10px] leading-none text-white"
        aria-label="Add language tab"
      >
        +
      </button>
    </div>
  )
}
