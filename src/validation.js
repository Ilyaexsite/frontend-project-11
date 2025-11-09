import * as yup from 'yup';


const createRssSchema = (existingUrls = []) => yup.object({
  url: yup
    .string()
    .required('URL не может быть пустым')
    .url('Ссылка должна быть валидным URL')
    .test(
      'unique-url',
      'RSS уже существует',
      (value) => !existingUrls.includes(value)
    ),
})


const validateRssUrl = (url, existingUrls = []) => {
  const schema = createRssSchema(existingUrls)
  
  return new Promise((resolve, reject) => {
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

export default validateRssUrl