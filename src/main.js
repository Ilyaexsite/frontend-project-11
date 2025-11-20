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

    // ПРОСТО И ЯСНО: показываем модальное окно
    modalElement.style.display = 'block'
    
    // Дебаг
    setTimeout(() => {
      window.debugModal()
    }, 100)
    // Принудительно обновляем DOM
    modalElement.offsetHeight
    
    console.log('Modal opened with display:', modalElement.style.display)
  }
}

const app = async () => {
  await initI18n()
  const state = createState()

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
// Дебаг функция для проверки видимости
window.debugModal = function() {
  const modal = document.getElementById('postModal')
  const modalBody = document.getElementById('modalBody')
  
  if (modal && modalBody) {
    console.log('DEBUG Modal:', {
      display: modal.style.display,
      computedDisplay: window.getComputedStyle(modal).display,
      visibility: window.getComputedStyle(modal).visibility,
      opacity: window.getComputedStyle(modal).opacity,
      text: modalBody.textContent
    })
    
    // Принудительно показываем
    modal.style.display = 'block'
    modal.style.visibility = 'visible'
    modal.style.opacity = '1'
    
    console.log('DEBUG After force show:', {
      display: modal.style.display,
      computedDisplay: window.getComputedStyle(modal).display
    })
  }
}
