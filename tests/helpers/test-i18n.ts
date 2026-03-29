import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'

/** Minimal i18n instance for tests (avoids depending on real localStorage locale). */
export const testI18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  },
})
