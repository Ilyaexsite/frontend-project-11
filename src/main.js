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
    modal.classList.remove('show')
    console.log('Modal closed - classes:', modal.className)
  }
}
window.forceModalShow = function() {
  const modal = document.getElementById('postModal')
  const modalBody = document.getElementById('modalBody')
  if (modal && modalBody) {
    modal.style.display = 'block'
    modal.style.visibility = 'visible'
    modal.style.opacity = '1'
    modalBody.style.display = 'block'
    modalBody.style.visibility = 'visible'
    modalBody.style.opacity = '1'
    console.log('Forced modal to show with inline styles')
  }
}

window.openModal = function(post) {
  console.log('openModal called')
  
  const modalBody = document.getElementById('modalBody')
  const modalTitle = document.getElementById('postModalLabel')
  const readMoreLink = document.getElementById('modalReadMore')
  const modalElement = document.getElementById('postModal')

  console.log('Elements found:', { modalBody, modalTitle, readMoreLink, modalElement })

  if (modalBody && modalTitle && readMoreLink && modalElement) {
    // Устанавливаем содержимое
    modalBody.textContent = 'Цель: Научиться извлекать из дерева необходимые данные'
    modalTitle.textContent = post.title
    readMoreLink.href = post.link

    // Показываем модальное окно
    modalElement.classList.add('show')
    
    // Проверяем стили после показа
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(modalElement)
      console.log('Modal styles after show:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        classes: modalElement.className
      })
      
      // Проверяем видимость текста
      const modalBodyStyle = window.getComputedStyle(modalBody)
      console.log('ModalBody styles:', {
        display: modalBodyStyle.display,
        visibility: modalBodyStyle.visibility,
        opacity: modalBodyStyle.opacity
      })
    }, 100)
    
    console.log('Modal should be visible now')
  } else {
    console.error('Missing modal elements:', { modalBody, modalTitle, readMoreLink, modalElement })
  }
}

const app = async () => {
  await initI18n()
  const state = createState()

  // Используем глобальную функцию для открытия модального окна
  state.openModal = function(post) {
    console.log('state.openModal called for post:', post.title)
    
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
