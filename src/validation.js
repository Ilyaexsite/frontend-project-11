import * as yup from 'yup'
import { t } from './i18n.js'

const createRssSchema = (existingUrls = []) => yup.object({
  url: yup
    .string()
    .required()
    .url()
    .notOneOf(existingUrls),
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
          return t(err.message, { values: err.params })
        })
        resolve({ isValid: false, errors })
      })
  })
}

const validateRssContent = (content) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isValid: true, error: null })
    }, 1000)
  })
}

export { validateRssUrl, validateRssContent }
export default validateRssUrl
