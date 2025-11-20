const elements = {
  rssForm: () => document.getElementById('rss-form'),
  rssUrlInput: () => document.getElementById('url-input'),
  submitButton: () => document.querySelector('button[type="submit"]'),
  feedsContainer: () => document.getElementById('feeds-container'),
  postsContainer: () => document.getElementById('posts-container'),
}

let currentWatchedState = null

const showFeedback = (message, type = 'success') => {
  let feedback = document.getElementById('feedback')
  if (!feedback) {
    feedback = document.createElement('div')
    feedback.id = 'feedback'
    const form = elements.rssForm()
    if (form && form.parentNode) {
      form.parentNode.insertBefore(feedback, form)
    }
  }
  
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'
  feedback.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert" data-testid="${type === 'success' ? 'success-message' : 'error-message'}">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `
}

const clearFeedback = () => {
  const feedback = document.getElementById('feedback')
  if (feedback) {
    feedback.innerHTML = ''
  }
}

const showValidationError = (input, message) => {
  if (!input) return
  input.classList.add('is-invalid')
  const feedback = document.createElement('div')
  feedback.className = 'invalid-feedback'
  feedback.textContent = message
  input.parentNode.appendChild(feedback)
}

const clearValidationError = (input) => {
  if (!input) return
  input.classList.remove('is-invalid')
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback')
  if (existingFeedback) {
    existingFeedback.remove()
  }
}

const setFormSubmitting = (isSubmitting) => {
  const button = elements.submitButton()
  const input = elements.rssUrlInput()
  
  if (button && input) {
    button.disabled = isSubmitting
    input.disabled = isSubmitting
    button.textContent = isSubmitting ? 'Добавление...' : 'Добавить'
  }
}

const clearForm = () => {
  const input = elements.rssUrlInput()
  if (input) {
    input.value = ''
    clearValidationError(input)
    input.focus()
  }
}

const updateFeedsList = (feeds) => {
  const container = elements.feedsContainer()
  if (!container) return

  if (feeds.length === 0) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Фиды</h2>
          <p class="card-text text-muted">Пока нет RSS потоков. Добавьте первый!</p>
        </div>
      </div>
    `
    return
  }

  const feedsHtml = feeds.map(feed => `
    <div class="card mb-3">
      <div class="card-body">
        <h3 class="card-title h6">${feed.title}</h3>
        <p class="card-text">${feed.description}</p>
      </div>
    </div>
  `).join('')

  container.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
        ${feedsHtml}
      </div>
    </div>
  `
}

const updatePostsList = (posts, readPosts, onPreviewClick) => {
  const container = elements.postsContainer()
  if (!container) return

  if (posts.length === 0) {
    container.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Посты</h2>
          <p class="card-text text-muted">Пока нет постов. Новые посты будут появляться автоматически.</p>
        </div>
      </div>
    `
    return
  }
  button.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const postId = button.getAttribute('data-post-id')
    const post = posts.find(p => p.id === postId)
    console.log('Preview button clicked for post:', post?.title)
    console.log('onPreviewClick function:', typeof onPreviewClick)
    if (post && onPreviewClick) {
      console.log('Calling onPreviewClick with post:', post.title)
      onPreviewClick(post)
    } else {
      console.error('Post not found or onPreviewClick not defined', { 
        postId, 
        post, 
        onPreviewClick: typeof onPreviewClick 
      })
    }
  })

  const postsHtml = posts.map(post => {
    const isRead = readPosts.has(post.id)
    const titleClass = isRead ? '' : 'fw-bold'
    
    return `
      <div class="list-group-item d-flex justify-content-between align-items-start border-0">
        <a href="${post.link}" class="${titleClass}" target="_blank" rel="noopener noreferrer">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">Просмотр</button>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
        <div class="list-group">
          ${postsHtml}
        </div>
      </div>
    </div>
  `

  // Добавляем обработчики для кнопок просмотра - ИСПРАВЛЕННАЯ ВЕРСИЯ
  container.querySelectorAll('button[data-post-id]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const postId = button.getAttribute('data-post-id')
      const post = posts.find(p => p.id === postId)
      console.log('Preview button clicked for post:', post?.title)
      if (post && onPreviewClick) {
        console.log('Calling onPreviewClick with post:', post.title)
        onPreviewClick(post)
      } else {
        console.error('Post not found or onPreviewClick not defined', { postId, post, onPreviewClick })
      }
    })
  })
}

// Делаем функцию глобальной
window.updatePostsList = updatePostsList

const handleStateChange = () => {
  if (!currentWatchedState) return
  
  const state = currentWatchedState.form.state
  
  switch (state) {
    case 'validating':
      setFormSubmitting(false)
      clearValidationError(elements.rssUrlInput())
      clearFeedback()
      break
      
    case 'invalid':
      setFormSubmitting(false)
      const errors = currentWatchedState.form.errors?.url || []
      if (errors.length > 0) {
        showValidationError(elements.rssUrlInput(), errors[0])
      }
      break
      
    case 'submitting':
      setFormSubmitting(true)
      clearValidationError(elements.rssUrlInput())
      clearFeedback()
      break
      
    case 'success':
      setFormSubmitting(false)
      clearForm()
      updateFeedsList(currentWatchedState.feeds)
      updatePostsList(currentWatchedState.posts, currentWatchedState.readPosts, currentWatchedState.openModal)
      showFeedback('RSS успешно загружен', 'success')
      
      setTimeout(() => {
        if (currentWatchedState.form.state === 'success') {
          currentWatchedState.form.state = 'filling'
        }
      }, 5000)
      break
      
    case 'error':
      setFormSubmitting(false)
      const error = currentWatchedState.ui.error
      let errorMessage = 'Ошибка сети'
      if (error === 'rssError') {
        errorMessage = 'Ресурс не содержит валидный RSS'
      } else if (error && error.includes('Failed to fetch')) {
        errorMessage = 'Ошибка сети'
      } else if (error) {
        errorMessage = error
      }
      showFeedback(errorMessage, 'error')
      
      setTimeout(() => {
        if (currentWatchedState.form.state === 'error') {
          currentWatchedState.form.state = 'filling'
        }
      }, 5000)
      break
      
    default:
      break
  }
}

const initView = (state, watchedState) => {
  currentWatchedState = watchedState
  
  const originalState = watchedState.form.state
  let currentState = originalState
  
  Object.defineProperty(watchedState.form, 'state', {
    get() { return currentState },
    set(newState) {
      if (newState !== currentState) {
        currentState = newState
        handleStateChange()
      }
    }
  })
  
  handleStateChange()
}

export { elements, initView }
