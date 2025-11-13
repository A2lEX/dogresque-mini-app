'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { type Locale } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ]

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Используем небольшую задержку, чтобы не закрыть меню сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isOpen])

  return (
      <div ref={containerRef} className="relative">
        <button
            type="button"
            onClick={handleToggle}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            aria-label="Change language"
            aria-expanded={isOpen}
        >
          <span className="text-lg pointer-events-none">{languages.find(l => l.code === locale)?.flag || '🌐'}</span>
          <span className="hidden md:inline text-sm font-medium uppercase pointer-events-none">{locale}</span>
          <svg
              className={`w-4 h-4 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
              {languages.map((lang) => (
                  <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        console.log('Language selected:', lang.code)
                        setLocale(lang.code)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-primary-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          locale === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                      }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {locale === lang.code && (
                        <svg className="w-5 h-5 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                  </button>
              ))}
            </div>
        )}
      </div>
  )
}
