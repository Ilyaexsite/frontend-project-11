import { t } from './i18n.js'

const elements = {
  get rssForm() { return document.getElementById('rss-form') },
  get rssUrlInput() { return document.getElementById('url-input') },
  get submitButton() { return document.querySelector('button[type="submit"]') },
  get feedsContainer() { return document.getElementById('feeds-container') },
  get postsContainer() { return document.getElementById('posts-container') },
}

const createStateObserver = (state, callback) => {
  let currentState = state

  return {
    setState(newState) {
      if (newState !== currentState) {
        const oldState = currentState
        currentState = newState
        callback(oldState, newState)
      }
    },
    getState() {
      return currentState
    },
  }
}

const createFeedbackElement = () => {
  let feedback = document.getElementById('feedback')
  if (!feedback) {
    feedback = document.createElement('div')
    feedback.id = 'feedback'
    feedback.className = 'mb-3'
    const form = elements.rssForm
    if (form && form.parentNode) {
      form.parentNode.insertBefore(feedback, form)
    }
  }
  return feedback
}

const showFeedback = (message, type = 'success') => {
  const feedback = createFeedbackElement()
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'

  feedback.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert" data-testid="success-message">
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
  const { submitButton, rssUrlInput } = elements
  if (!submitButton || !rssUrlInput) return

  if (isSubmitting) {
    submitButton.disabled = true
    submitButton.textContent = 'Добавление...'
    rssUrlInput.disabled = true
  }
  else {
    submitButton.disabled = false
    submitButton.textContent = 'Добавить'
    rssUrlInput.disabled = false
  }
}

const clearForm = () => {
  const { rssUrlInput } = elements
  if (!rssUrlInput) return
  rssUrlInput.value = ''
  clearValidationError(rssUrlInput)
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus()
  }, 100)
}

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements
  if (!feedsContainer) return

  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
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

  feedsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
        ${feedsHtml}
      </div>
    </div>
  `
}

const updatePostsList = (posts, readPosts, onPreviewClick) => {
  const { postsContainer } = elements
  if (!postsContainer) return

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Посты</h2>
          <p class="card-text text-muted">Пока нет постов. Новые посты будут появляться автоматически.</p>
        </div>
      </div>
    `
    return
  }

  const postsHtml = posts.map((post) => {
    const isRead = readPosts.has(post.id)
    const titleClass = isRead ? '' : 'fw-bold'

    return `
    <div class="list-group-item d-flex justify-content-between align-items-start border-0">
      <a href="${post.link}" class="${titleClass}" target="_blank" rel="noopener noreferrer">
        ${post.title}
      </a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">
        Просмотр
      </button>
    </div>
    `
  }).join('')

  postsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
        <div class="list-group">
          ${postsHtml}
        </div>
      </div>
    </div>
  `

  const viewButtons = postsContainer.querySelectorAll('button[data-post-id]')
  viewButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const postId = event.currentTarget.getAttribute('data-post-id')
      const post = posts.find(p => p.id === postId)
      if (post) {
        onPreviewClick(post)
      }
    })
  })
}

const initView = (state, watchedState) => {
  try {
    const { rssUrlInput } = elements

    if (!rssUrlInput) return

    const formStateObserver = createStateObserver(watchedState.form.state, (oldState, newState) => {
      switch (newState) {
        case 'validating':
          setFormSubmitting(false)
          clearValidationError(rssUrlInput)
          clearFeedback()
          break

        case 'invalid': {
          setFormSubmitting(false)
          const errors = watchedState.form.errors?.url || []
          if (errors.length > 0 && rssUrlInput) {
            showValidationError(rssUrlInput, errors[0])
          }
          break
        }

        case 'submitting':
          setFormSubmitting(true)
          clearValidationError(rssUrlInput)
          clearFeedback()
          break

        case 'success':
          setFormSubmitting(false)
          clearForm()
          updateFeedsList(watchedState.feeds)
          updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
            watchedState.openModal(post)
          })
          showFeedback('RSS успешно загружен', 'success')

          setTimeout(() => {
            if (watchedState.form.state === 'success') {
              watchedState.form.state = 'filling'
            }
          }, 10000)
          break

          case 'error': {
            setFormSubmitting(false)
            const error = watchedState.ui?.error
            let errorMessage = 'Ошибка сети'
            if (error === 'rssError') {
              errorMessage = 'Ресурс не содержит валидный RSS'
            }
            else if (error && error.includes('Failed to fetch')) {
              errorMessage = 'Ошибка сети'
            }
            else if (error) {
              errorMessage = error
            }
            showFeedback(errorMessage, 'error')
          
            setTimeout(() => {
              if (watchedState.form.state === 'error') {
                watchedState.form.state = 'filling'
              }
            }, 5000)
            break
          }

        default:
          break
      }
    })

    const originalFormStateSetter = Object.getOwnPropertyDescriptor(watchedState.form, 'state').set
    Object.defineProperty(watchedState.form, 'state', {
      get() {
        return formStateObserver.getState()
      },
      set(newState) {
        formStateObserver.setState(newState)
        if (originalFormStateSetter) {
          originalFormStateSetter.call(watchedState.form, newState)
        }
      },
    })

    let currentFeeds = [...watchedState.feeds]
    let currentPosts = [...watchedState.posts]

    setInterval(() => {
      if (watchedState.feeds.length !== currentFeeds.length) {
        updateFeedsList(watchedState.feeds)
        currentFeeds = [...watchedState.feeds]
      }

      if (watchedState.posts.length !== currentPosts.length) {
        updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
          watchedState.openModal(post)
        })
        currentPosts = [...watchedState.posts]
      }
    }, 100)

    setTimeout(() => {
      if (rssUrlInput) rssUrlInput.focus()
    }, 100)
  }
  catch (error) {
    console.error('Error in initView:', error)
  }
}

export {
  elements,
  initView
}
