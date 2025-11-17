import * as yup from 'yup'
import { t } from './i18n.js'

const createRssSchema = (existingUrls = []) => yup.object({
  url: yup
    .string()
    .required('errors.required')
    .url('errors.url')
    .notOneOf(existingUrls, 'errors.notOneOf'),
})

const validateRssUrl = (url, existingUrls = []) => {
  console.log('🛠️ Validating URL:', url)
  console.log('📊 Existing URLs:', existingUrls)

  const schema = createRssSchema(existingUrls)

  return new Promise((resolve) => {
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        console.log('✅ URL validation passed')
        resolve({ isValid: true, errors: [] })
      })
      .catch((validationError) => {
        console.log('❌ URL validation failed:', validationError.errors)
        const errors = validationError.inner.map((err) => {
          return t(err.message)
        })
        resolve({ isValid: false, errors })
      })
  })
}

const validateRssContent = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isValid: true, error: null })
    }, 1000)
  })
}

export { validateRssUrl, validateRssContent }
export default validateRssUrl
