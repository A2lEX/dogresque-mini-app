import en from '@/locales/en/common.json'
import ru from '@/locales/ru/common.json'

export type Locale = 'en' | 'ru'

export const defaultLocale: Locale = 'en'
export const locales: Locale[] = ['en', 'ru']

export const translations = {
  en,
  ru,
} as const

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale] || translations[defaultLocale]
}

export function getNestedTranslation(obj: any, path: string): string {
  const keys = path.split('.')
  let result: any = obj
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return path
    }
  }
  
  return typeof result === 'string' ? result : path
}

