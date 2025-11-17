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
  console.log('🚀 App starting...')

  try {
    await initI18n()
    console.log('✅ i18n initialized')

    const state = createState()
    console.log('✅ State created')

    // Простая функция для создания модального окна без Bootstrap
    const createSimpleModal = (post) => {
      console.log('🔄 Creating simple modal')

      // Удаляем существующее модальное окно если есть
      const existingModal = document.getElementById('simplePostModal')
      if (existingModal) {
        existingModal.remove()
      }

      const modalHtml = `
        <div id="simplePostModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h5 style="margin: 0;">${post.title}</h5>
              <button onclick="document.getElementById('simplePostModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div>
              <p>Цель: Научиться извлекать из дерева необходимые данные</p>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <a href="${post.link}" target="_blank" style="text-decoration: none; padding: 8px 16px; background: #007bff; color: white; border-radius: 4px;">Читать полностью</a>
              <button onclick="document.getElementById('simplePostModal').remove()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Закрыть</button>
            </div>
          </div>
        </div>
      `

      document.body.insertAdjacentHTML('beforeend', modalHtml)
      console.log('✅ Simple modal created and visible')
    }

    state.openModal = (post) => {
      console.log('🔄 Opening modal for post:', post.title)

      // Добавляем пост в прочитанные
      state.readPosts.add(post.id)

      // Обновляем список постов чтобы убрать жирный шрифт
      if (window.updatePostsList) {
        window.updatePostsList(state.posts, state.readPosts, state.openModal)
      }

      // Используем простую версию модального окна для надежности
      createSimpleModal(post)
    }

    console.log('🔄 Calling initView...')
    initView(state, state)
    console.log('✅ View initialized')

    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('📋 Main.js elements after initView:', {
      form: !!elements.rssForm,
      input: !!elements.rssUrlInput,
      formId: elements.rssForm?.id,
      inputId: elements.rssUrlInput?.id,
    })

    if (elements.rssUrlInput) {
      console.log('✅ Adding input handler')
      elements.rssUrlInput.addEventListener('input', (event) => {
        console.log('📝 Input changed:', event.target.value)
        setFormUrl(state, event.target.value.trim())
      })
    } else {
      console.error('❌ Input element not found!')
    }

    if (elements.rssForm) {
      console.log('✅ Adding submit handler to form')

      const formHandler = async (event) => {
        console.log('🎯 MAIN.JS FORM SUBMIT EVENT FIRED!')
        event.preventDefault()
        event.stopPropagation()

        console.log('=== FORM SUBMISSION STARTED ===')

        const url = getFormUrl(state)
        const existingUrls = getFeeds(state).map(feed => feed.url)

        console.log('📝 URL to validate:', url)
        console.log('📋 Existing URLs:', existingUrls)

        setFormState(state, 'validating')
        clearError(state)

        try {
          console.log('🔍 Starting validation...')
          const validationResult = await validateRssUrl(url, existingUrls)
          console.log('✅ Validation result:', validationResult)

          if (!validationResult.isValid) {
            console.log('❌ Validation failed with errors:', validationResult.errors)
            setFormErrors(state, { url: validationResult.errors })
            setFormState(state, 'invalid')
            return
          }

          console.log('🎯 Validation passed, setting state to submitting')
          setFormState(state, 'submitting')

          console.log('📥 Starting RSS load...')
          const rssData = await loadRssFeed(url)
          console.log('✅ RSS loaded successfully:', {
            title: rssData.title,
            description: rssData.description,
            postsCount: rssData.posts?.length,
          })

          console.log('💾 Adding feed to state...')
          addFeed(state, rssData)
          addPosts(state, rssData.posts.map(post => ({
            ...post,
            feedId: rssData.url,
          })))

          console.log('🎉 Setting state to SUCCESS')
          setFormState(state, 'success')
        } catch (error) {
          console.error('💥 Error in form submission:', error)
          console.error('Error message:', error.message)
          setError(state, error.message)
          setFormState(state, 'error')
        }
      }

      elements.rssForm.addEventListener('submit', formHandler)
      console.log('✅ Submit handler added to form')
    } else {
      console.error('❌ Form element not found!')
      const formById = document.getElementById('rss-form')
      console.log('🔍 Form search by ID:', !!formById)
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        clearFormState(state)
      }
    })

    console.log('✅ App initialization complete')
  } catch (error) {
    console.error('💥 Error in app initialization:', error)
    console.error('Error stack:', error.stack)
  }
}

console.log('📜 Main.js module loaded')
document.addEventListener('DOMContentLoaded', app)
