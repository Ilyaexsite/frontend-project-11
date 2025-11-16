import './styles/main.css'
import { initI18n, t } from './i18n.js'
import createState, {
  getFormUrl,
  getFeeds,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  setNotification,
  setLanguage,
} from './state.js'
import { validateRssUrl } from './validation.js'
import { elements, initView } from './view.js'

const app = async () => {
  await initI18n()
  
  const state = createState()
  
  initView(state, state)
  
  const { rssForm, rssUrlInput } = elements
  
  if (rssUrlInput) {
    rssUrlInput.addEventListener('input', (event) => {
      setFormUrl(state, event.target.value.trim())
    })
  }
  
  if (rssForm) {
    rssForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      
      const url = getFormUrl(state)
      const existingUrls = getFeeds(state).map(feed => feed.url)
      
      setFormState(state, 'validating')
      
      try {
        const validationResult = await validateRssUrl(url, existingUrls)
        
        if (!validationResult.isValid) {
          setFormErrors(state, { url: validationResult.errors })
          setFormState(state, 'invalid')
          return
        }
        
        setFormState(state, 'submitting')
        
        await new Promise((resolve) => {
          setTimeout(() => {
            addFeed(state, url)
            resolve()
          }, 1500)
        })
        
        setFormState(state, 'success')
        setNotification(state, {
          message: t('notifications.success'),
          type: 'success',
        })
        
      } catch (error) {
        console.error('Error adding RSS:', error)
        setFormState(state, 'error')
        setNotification(state, {
          message: t('notifications.error'),
          type: 'error',
        })
      }
    })
  }
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state)
    }
  })
  
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'l') {
      const currentLng = i18next.language
      const newLng = currentLng === 'ru' ? 'en' : 'ru'
      setLanguage(state, newLng)
    }
  })
}

document.addEventListener('DOMContentLoaded', app)
