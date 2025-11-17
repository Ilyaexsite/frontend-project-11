import i18next from 'i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import * as yup from 'yup'

const setupYupLocale = () => {
  yup.setLocale({
    mixed: {
      required: 'errors.required',
      notOneOf: 'errors.notOneOf',
    },
    string: {
      url: 'errors.url',
    },
  })
}

const initI18n = () => {
  return i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
      fallbackLng: 'ru',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    })
    .then(() => {
      setupYupLocale()
      return i18next
    })
}

const t = (key, options = {}) => i18next.t(key, options)

const translateError = (error) => {
  if (typeof error === 'string') {
    return t(error)
  }
  if (error.key) {
    return t(error.key, error.options)
  }
  
return t('errors.unknown')
}

export { initI18n, t, translateError }
export default i18next
