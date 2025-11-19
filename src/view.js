const elements = {
  rssForm: () => document.getElementById('rss-form'),
  rssUrlInput: () => document.getElementById('url-input'),
  submitButton: () => document.querySelector('button[type="submit"]'),
  feedsContainer: () => document.getElementById('feeds-container'),
  postsContainer: () => document.getElementById('posts-container'),
}

let currentWatchedState = null

const showFeedback = (message) => {
  let feedback = document.getElementById('feedback')
  if (!feedback) {
    feedback = document.createElement('div')
    feedback.id = 'feedback'
    const form = elements.rssForm()
    if (form && form.parentNode) {
      form.parentNode.insertBefore(feedback, form)
    }
  }
  
  feedback.innerHTML = `<div class="alert alert-success" data-testid="success-message">${message}</div>`
}

const clearFeedback = () => {
  const feedback = document.getElementById('feedback')
  if (feedback) {
    feedback.innerHTML = ''
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
    input.focus()
  }
}

const updateFeedsList = (feeds) => {
  const container = elements.feedsContainer()
  if (!container) return

  if (feeds.length === 0) {
    container.innerHTML = '<div class="card"><div class="card-body"><h2>Фиды</h2><p>Пока нет RSS потоков</p></div></div>'
    return
  }

  const feedsHtml = feeds.map(feed => `
    <div class="card mb-3">
      <div class="card-body">
        <h3 class="h6">${feed.title}</h3>
        <p>${feed.description}</p>
      </div>
    </div>
  `).join('')

  container.innerHTML = `<div class="card"><div class="card-body"><h2>Фиды</h2>${feedsHtml}</div></div>`
}

const updatePostsList = (posts, readPosts, onPreviewClick) => {
  const container = elements.postsContainer()
  if (!container) return

  if (posts.length === 0) {
    container.innerHTML = '<div class="card"><div class="card-body"><h2>Посты</h2><p>Пока нет постов</p></div></div>'
    return
  }

  const postsHtml = posts.map(post => {
    const isRead = readPosts.has(post.id)
    const titleClass = isRead ? '' : 'fw-bold'
    
    return `
      <div class="list-group-item d-flex justify-content-between align-items-start">
        <a href="${post.link}" class="${titleClass}" target="_blank">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">Просмотр</button>
      </div>
    `
  }).join('')

  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h2>Посты</h2>
        <div class="list-group">${postsHtml}</div>
      </div>
    </div>
  `

  container.querySelectorAll('button[data-post-id]').forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-post-id')
      const post = posts.find(p => p.id === postId)
      if (post && onPreviewClick) onPreviewClick(post)
    })
  })
}

const handleStateChange = () => {
  if (!currentWatchedState) return
  
  const state = currentWatchedState.form.state
  
  switch (state) {
    case 'validating':
      setFormSubmitting(false)
      clearFeedback()
      break
      
    case 'submitting':
      setFormSubmitting(true)
      clearFeedback()
      break
      
    case 'success':
      setFormSubmitting(false)
      clearForm()
      updateFeedsList(currentWatchedState.feeds)
      updatePostsList(currentWatchedState.posts, currentWatchedState.readPosts, currentWatchedState.openModal)
      showFeedback('RSS успешно загружен')
      break
      
    case 'error':
      setFormSubmitting(false)
      break
      
    default:
      break
  }
}

const initView = (state, watchedState) => {
  currentWatchedState = watchedState
  
  const originalState = watchedState.form.state
  Object.defineProperty(watchedState.form, 'state', {
    get() { return this._state || originalState },
    set(newState) {
      this._state = newState
      handleStateChange()
    }
  })
  
  handleStateChange()
}

export { elements, initView }
