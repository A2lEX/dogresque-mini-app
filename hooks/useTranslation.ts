'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslations, getNestedTranslation } from '@/lib/i18n'

export function useTranslation() {
  const { locale } = useLanguage()
  const translations = getTranslations(locale)

  const t = (path: string): string => {
    return getNestedTranslation(translations, path)
  }

  return { t, locale }
}

