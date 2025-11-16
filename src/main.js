import './styles/main.css'
import { initI18n, t } from './i18n.js'
import createState, {
  getFormUrl,
  getFeeds,
  getPostsByFeed,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  addPosts,
  addNewPosts,
  setLanguage,
  setLoading,
  setError,
  clearError,
  markPostAsRead,
} from './state.js'
import { validateRssUrl } from './validation.js'
import { loadRssFeed, checkFeedUpdates } from './rss.js'
import { elements, initView } from './view.js'
import FeedUpdater from './updater.js'

const app = async () => {
  await initI18n()
  
  const state = createState()
  
  const handleFeedUpdate = (currentState) => async (feedUrl) => {
    const existingPosts = getPostsByFeed(currentState, feedUrl)
    
    try {
      const updateResult = await checkFeedUpdates(feedUrl, existingPosts)
      
      if (updateResult.newPosts.length > 0) {
        addNewPosts(currentState, updateResult.newPosts)
      }
      
      return updateResult
    } catch (error) {
      return { newPosts: [], feedUrl, error: error.message }
    }
  }

  const feedUpdater = new FeedUpdater(handleFeedUpdate(state), 5000)
  
  state.openModal = (post) => {
    markPostAsRead(state, post.id)
  }
  
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
      clearError(state)
      
      try {
        const validationResult = await validateRssUrl(url, existingUrls)
        
        if (!validationResult.isValid) {
          setFormErrors(state, { url: validationResult.errors })
          setFormState(state, 'invalid')
          return
        }
        
        setFormState(state, 'submitting')
        setLoading(state, true)
        
        // Загружаем RSS
        const rssData = await loadRssFeed(url)
        
        addFeed(state, rssData)
        addPosts(state, rssData.posts.map(post => ({
          ...post,
          feedId: rssData.url,
        })))
        
        feedUpdater.addFeed({ url: rssData.url })
        feedUpdater.start()
        
        setFormState(state, 'success')
        
      } catch (error) {
        console.error('Error loading RSS:', error)
        setError(state, error.message)
        setFormState(state, 'error')
      } finally {
        setLoading(state, false)
      }
    })
  }
  
  state.feeds = onChange(state.feeds, () => {
    feedUpdater.setFeeds(getFeeds(state))
    if (state.feeds.length > 0) {
      feedUpdater.start()
    } else {
      feedUpdater.stop()
    }
  })
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state)
    }
  })
  
  window.addEventListener('beforeunload', () => {
    feedUpdater.stop()
  })
}

if (!window.appInitialized) {
  window.appInitialized = true
  document.addEventListener('DOMContentLoaded', app)
}
