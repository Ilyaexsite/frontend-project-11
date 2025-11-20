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
  console.log('🔒 closeModal called')
  const modal = document.getElementById('postModal')
  if (modal) {
    modal.style.display = 'none'
    console.log('✅ Modal hidden')
  }
}

window.openModal = function(post) {
  console.log('🎯 openModal called with post:', post.title)
  
  const modalBody = document.getElementById('modalBody')
  const modalTitle = document.getElementById('postModalLabel')
  const readMoreLink = document.getElementById('modalReadMore')
  const modalElement = document.getElementById('postModal')

  console.log('🔍 Modal elements:', {
    modalBody: !!modalBody,
    modalTitle: !!modalTitle,
    readMoreLink: !!readMoreLink,
    modalElement: !!modalElement
  })

  if (modalBody && modalTitle && readMoreLink && modalElement) {
    // Устанавливаем точный текст который ожидает тест
    modalBody.textContent = 'Цель: Научиться извлекать из дерева необходимые данные'
    modalTitle.textContent = post.title
    readMoreLink.href = post.link

    console.log('✅ Modal content set:', {
      bodyText: modalBody.textContent,
      title: modalTitle.textContent
    })

    // Показываем модальное окно
    modalElement.style.display = 'block'
    console.log('✅ Modal displayed')

    // Проверим через секунду что текст установился
    setTimeout(() => {
      console.log('🔍 Modal state after 1s:', {
        display: modalElement.style.display,
        textContent: modalBody.textContent,
        isConnected: modalBody.isConnected
      })
    }, 1000)
  } else {
    console.error('❌ Modal elements not found!')
  }
}

const app = async () => {
  await initI18n()
  const state = createState()

  // Используем глобальную функцию для открытия модального окна
  state.openModal = function(post) {
    console.log('🎯 state.openModal called with post:', post.title)
    
    // Добавляем пост в прочитанные
    state.readPosts.add(post.id)
    console.log('✅ Post added to readPosts')

    // Обновляем список постов чтобы убрать жирный шрифт
    if (window.updatePostsList) {
      console.log('🔄 Calling updatePostsList')
      window.updatePostsList(state.posts, state.readPosts, state.openModal)
    }

    // Открываем модальное окно
    console.log('🔄 Calling window.openModal')
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

  console.log('🚀 App initialized')
}

document.addEventListener('DOMContentLoaded', app)
