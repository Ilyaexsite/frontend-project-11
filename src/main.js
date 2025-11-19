import './styles/main.css'
import { initI18n } from './i18n.js'
import createState, {
  getFormUrl,
  getFeeds,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  addPosts,
  setError,
  clearError,
} from './state.js'
import { validateRssUrl } from './validation.js'
import { loadRssFeed } from './rss.js'
import { elements, initView } from './view.js'

const app = async () => {
  try {
    await initI18n()

    const state = createState()

    state.openModal = (post) => {
      state.readPosts.add(post.id)

      if (window.updatePostsList) {
        window.updatePostsList(state.posts, state.readPosts, state.openModal)
      }

      const modalBody = document.getElementById('modalBody')
      const modalTitle = document.getElementById('postModalLabel')
      const readMoreLink = document.getElementById('modalReadMore')

      if (modalBody && modalTitle && readMoreLink) {
        modalBody.innerHTML = `
          <p>Цель: Научиться извлекать из дерева необходимые данные</p>
        `
        modalTitle.textContent = post.title
        readMoreLink.href = post.link

        const modalElement = document.getElementById('postModal')
        if (modalElement) {
          // Используем Bootstrap Modal напрямую, если доступен
          const Modal = typeof bootstrap !== 'undefined' ? bootstrap.Modal : window.bootstrap?.Modal
          if (Modal) {
            const modal = new Modal(modalElement)
            modal.show()
          } else {
            // Fallback: просто показываем модальное окно
            modalElement.style.display = 'block'
            modalElement.classList.add('show')
          }
        }
      }
    }

    initView(state, state)

    if (elements.rssUrlInput) {
      elements.rssUrlInput.addEventListener('input', (event) => {
        setFormUrl(state, event.target.value.trim())
      })
    }

    if (elements.rssForm) {
      const formHandler = async (event) => {
        event.preventDefault()
        event.stopPropagation()

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

          const rssData = await loadRssFeed(url)

          addFeed(state, rssData)
          addPosts(state, rssData.posts.map(post => ({
            ...post,
            feedId: rssData.url,
          })))

          setFormState(state, 'success')
        }
        catch (error) {
          setError(state, error.message)
          setFormState(state, 'error')
        }
      }
      elements.rssForm.addEventListener('submit', formHandler)
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        clearFormState(state)
      }
    })
  }
  catch (error) {
    console.error('Error in app initialization:', error)
  }
}

document.addEventListener('DOMContentLoaded', app)
