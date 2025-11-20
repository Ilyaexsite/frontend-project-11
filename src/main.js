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
// Глобальные функции для работы с модальным окном
window.closeModal = function() {
  const modal = document.getElementById('postModal')
  if (modal) {
    modal.style.display = 'none'
  }
}
window.openModal = function(post) {
  const modalBody = document.getElementById('modalBody')
  const modalTitle = document.getElementById('postModalLabel')
  const readMoreLink = document.getElementById('modalReadMore')
  const modalElement = document.getElementById('postModal')
  if (modalBody && modalTitle && readMoreLink && modalElement) {
    // Устанавливаем содержимое
    modalBody.textContent = 'Цель: Научиться извлекать из дерева необходимые данные'
    modalTitle.textContent = post.title
    readMoreLink.href = post.link
    // Показываем модальное окно с принудительными стилями
    modalElement.style.display = 'block'
    modalElement.style.visibility = 'visible'
    modalElement.style.opacity = '1'
    modalElement.style.zIndex = '10000'
    // Принудительно обновляем стили текста
    modalBody.style.display = 'block'
    modalBody.style.visibility = 'visible'
    modalBody.style.opacity = '1'
    // Принудительно обновляем DOM
    modalElement.offsetHeight
  }
}

const app = async () => {
  await initI18n()
  const state = createState()

  // Создаем функцию openModal
  const openModalFunction = function(post) {
    // Добавляем пост в прочитанные
    state.readPosts.add(post.id)

    // Обновляем список постов чтобы убрать жирный шрифт
    if (window.updatePostsList) {
      window.updatePostsList(state.posts, state.readPosts, openModalFunction)
    }

    // Открываем модальное окно
    window.openModal(post)
  }

  // Присваиваем функцию state
  state.openModal = openModalFunction

  initView(state, state)

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

  const input = elements.rssUrlInput()
  if (input) {
    input.addEventListener('input', (e) => {
      setFormUrl(state, e.target.value.trim())
    })
  }

  // Закрытие по клику вне модального окна
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('postModal')
    if (modal && e.target === modal) {
      window.closeModal()
    }
  })

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeModal()
    }
  })
}

document.addEventListener('DOMContentLoaded', app)
