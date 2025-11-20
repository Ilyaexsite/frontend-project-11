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

// Глобальные переменные для модального окна
let postModal = null

// Инициализация модального окна после загрузки DOM
const initModal = () => {
  const modalElement = document.getElementById('postModal')
  if (modalElement && typeof bootstrap !== 'undefined') {
    postModal = new bootstrap.Modal(modalElement)
  }
}

// Глобальные функции для работы с модальным окном
window.closeModal = function() {
  if (postModal) {
    postModal.hide()
  }
}

window.openModal = function(post) {
  const modalBody = document.getElementById('modalBody')
  const modalTitle = document.getElementById('postModalLabel')
  const readMoreLink = document.getElementById('modalReadMore')

  if (modalBody && modalTitle && readMoreLink) {
    // Устанавливаем содержимое
    modalBody.textContent = 'Цель: Научиться извлекать из дерева необходимые данные'
    modalTitle.textContent = post.title
    readMoreLink.href = post.link

    // Показываем модальное окно
    if (postModal) {
      postModal.show()
    } else {
      // Fallback если Bootstrap не загрузился
      const modalElement = document.getElementById('postModal')
      if (modalElement) {
        modalElement.classList.add('show')
        modalElement.style.display = 'block'
        modalElement.setAttribute('aria-hidden', 'false')
        
        // Добавляем backdrop
        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'
        document.body.appendChild(backdrop)
        document.body.classList.add('modal-open')
      }
    }
  }
}

const app = async () => {
  await initI18n()
  const state = createState()

  // Инициализируем модальное окно
  initModal()

  // Используем глобальную функцию для открытия модального окна
  state.openModal = function(post) {
    // Добавляем пост в прочитанные
    state.readPosts.add(post.id)

    // Обновляем список постов чтобы убрать жирный шрифт
    if (window.updatePostsList) {
      window.updatePostsList(state.posts, state.readPosts, state.openModal)
    }

    // Открываем модальное окно
    window.openModal(post)
  }

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

  // Обработчики для модального окна (fallback)
  document.addEventListener('click', (e) => {
    // Закрытие по клику вне модального окна
    const modal = document.getElementById('postModal')
    if (modal && e.target === modal) {
      window.closeModal()
    }
    
    // Закрытие по кнопке "Закрыть" если Bootstrap не работает
    if (e.target.classList.contains('btn-secondary') && e.target.textContent === 'Закрыть') {
      window.closeModal()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeModal()
    }
  })
}

// Инициализируем модальное окно когда DOM готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app)
} else {
  app()
}
