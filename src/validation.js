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
  const schema = createRssSchema(existingUrls)

  return new Promise((resolve) => {
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        resolve({ isValid: true, errors: [] })
      })
      .catch((validationError) => {
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
