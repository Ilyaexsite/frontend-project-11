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
  await initI18n()
  const state = createState()

  // Простая и надежная функция для открытия модального окна
  state.openModal = (post) => {
    try {
      // Добавляем пост в прочитанные
      state.readPosts.add(post.id)

      // Обновляем список постов чтобы убрать жирный шрифт
      if (window.updatePostsList) {
        window.updatePostsList(state.posts, state.readPosts, state.openModal)
      }

      // Находим элементы модального окна
      const modalBody = document.getElementById('modalBody')
      const modalTitle = document.getElementById('postModalLabel')
      const readMoreLink = document.getElementById('modalReadMore')
      const modalElement = document.getElementById('postModal')

      // Проверяем что все элементы найдены
      if (!modalBody || !modalTitle || !readMoreLink || !modalElement) {
        console.error('Modal elements not found')
        return
      }

      // Устанавливаем содержимое
      modalBody.textContent = 'Цель: Научиться извлекать из дерева необходимые данные'
      modalTitle.textContent = post.title
      readMoreLink.href = post.link

      // Открываем модальное окно с помощью Bootstrap
      if (window.bootstrap && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement)
        modal.show()
      } else {
        // Fallback: просто показываем элемент
        modalElement.style.display = 'block'
        modalElement.classList.add('show')
      }
    } catch (error) {
      console.error('Error in openModal:', error)
    }
  }

  initView(state, state)

  // Обработчик формы
  const form = elements.rssForm()
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
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
    })
  }

  // Обработчик ввода
  const input = elements.rssUrlInput()
  if (input) {
    input.addEventListener('input', (e) => {
      setFormUrl(state, e.target.value.trim())
    })
  }
}

// Ждем загрузки DOM и Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app)
} else {
  // Если DOM уже загружен, ждем немного чтобы Bootstrap успел загрузиться
  setTimeout(app, 100)
}
