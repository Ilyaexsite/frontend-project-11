import * as yup from 'yup'

const createRssSchema = (existingUrls = []) => yup.object({
  url: yup
    .string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(existingUrls, 'RSS уже существует'),
})

const validateRssUrl = (url, existingUrls = []) => {
  const schema = createRssSchema(existingUrls)

  return new Promise((resolve) => {
    schema.validate({ url }, { abortEarly: false })
      .then(() => {
        resolve({ isValid: true, errors: [] })
      })
      .catch((validationError) => {
        const errors = validationError.inner.map((err) => err.message)
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
