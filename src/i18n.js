import { createI18n } from 'vue-i18n'
import pt from './locales/pt.js'
import en from './locales/en.js'

function initialLocale() {
  try {
    const saved = localStorage.getItem('locale')
    if (saved === 'pt' || saved === 'en') return saved
  } catch {}
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'pt',
  messages: { pt, en },
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
  try { localStorage.setItem('locale', locale) } catch {}
}

// Seleciona o texto bilíngue de um campo { pt, en } dos dados de projeto.
export const pick = (field) => (field && typeof field === 'object' ? field[i18n.global.locale.value] ?? field.pt : field)
