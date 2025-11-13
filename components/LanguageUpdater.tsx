'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageUpdater() {
  const { locale } = useLanguage()

  useEffect(() => {
    // Обновляем атрибут lang в html элементе
    document.documentElement.lang = locale
  }, [locale])

  return null
}

