import { t } from './i18n.js'
import i18next from './i18n.js'
import onChange from 'on-change'

const elements = {
  rssForm: document.getElementById('rss-form'),
  rssUrlInput: document.getElementById('url-input'), // Изменён ID
  submitButton: document.querySelector('button[type="submit"]'),
  feedsContainer: document.getElementById('feeds-container'),
  postsContainer: document.getElementById('posts-container'),
  feedback: document.getElementById('feedback'),
}

const createFeedbackElement = () => {
  if (!elements.feedback) {
    const feedbackElement = document.createElement('div')
    feedbackElement.id = 'feedback'
    feedbackElement.className = 'mb-3'
    const form = document.getElementById('rss-form')
    if (form) {
      form.parentNode.insertBefore(feedbackElement, form)
    } else {
      document.querySelector('.card-body').prepend(feedbackElement)
    }
    elements.feedback = feedbackElement
  }
}

const updateUITexts = () => {
  const { rssUrlInput, submitButton } = elements

  if (rssUrlInput) rssUrlInput.placeholder = t('form.placeholder')
  if (submitButton) submitButton.textContent = t('form.submit')
}

const showValidationError = (input, message) => {
  input.classList.add('is-invalid')
  
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback')
  if (existingFeedback) {
    existingFeedback.remove()
  }
  
  const feedback = document.createElement('div')
  feedback.className = 'invalid-feedback'
  feedback.textContent = message
  input.parentNode.appendChild(feedback)
}

const clearValidationError = (input) => {
  input.classList.remove('is-invalid')
  
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback')
  if (existingFeedback) {
    existingFeedback.remove()
  }
}

const showFeedback = (message, type = 'success') => {
  createFeedbackElement()
  
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'
  elements.feedback.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `
  
  setTimeout(() => {
    if (elements.feedback) {
      elements.feedback.innerHTML = ''
    }
  }, 5000)
}

const clearFeedback = () => {
  if (elements.feedback) {
    elements.feedback.innerHTML = ''
  }
}

const setFormSubmitting = (isSubmitting) => {
  const { submitButton, rssUrlInput } = elements
  
  if (isSubmitting) {
    submitButton.disabled = true
    submitButton.textContent = t('form.submitting')
    rssUrlInput.disabled = true
  } else {
    submitButton.disabled = false
    submitButton.textContent = t('form.submit')
    rssUrlInput.disabled = false
  }
}

const clearForm = () => {
  const { rssUrlInput } = elements
  
  rssUrlInput.value = ''
  clearValidationError(rssUrlInput)
  
  setTimeout(() => {
    rssUrlInput.focus()
  }, 100)
}

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements
  
  if (!feedsContainer) return
  
  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">${t('feeds.title')}</h2>
          <p class="card-text text-muted">${t('feeds.empty')}</p>
        </div>
      </div>
    `
    return
  }
  
  const feedsHtml = feeds.map((feed) => `
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
        <h2 class="card-title h4">${t('feeds.title')}</h2>
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
          <h2 class="card-title h4">${t('posts.title')}</h2>
          <p class="card-text text-muted">${t('posts.empty')}</p>
        </div>
      </div>
    `
    return
  }
  
  const sortedPosts = [...posts].reverse()
  
  const postsHtml = sortedPosts.map((post) => {
    const isRead = readPosts.has(post.id)
    const titleClass = isRead ? 'fw-normal' : 'fw-bold'
    
    return `
    <div class="list-group-item d-flex justify-content-between align-items-start border-0">
      <div class="ms-2 me-auto">
        <a href="${post.link}" class="${titleClass} text-dark text-decoration-none" target="_blank" rel="noopener noreferrer">
          ${post.title}
        </a>
      </div>
      <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">
        ${t('posts.view')}
      </button>
    </div>
    `
  }).join('')
  
  postsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${t('posts.title')}</h2>
        <div class="list-group">
          ${postsHtml}
        </div>
      </div>
    </div>
  `
  
  const viewButtons = postsContainer.querySelectorAll('button[data-post-id]')
  viewButtons.forEach(button => {
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
  updateUITexts()
  
  i18next.on('languageChanged', () => {
    updateUITexts()
    updateFeedsList(watchedState.feeds)
    updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
      watchedState.openModal(post)
    })
  })
  
  const { rssUrlInput } = elements
  
  watchedState.form.state = onChange(watchedState.form.state, (path, value) => {
    switch (value) {
      case 'validating':
        setFormSubmitting(false)
        clearValidationError(rssUrlInput)
        clearFeedback()
        break
        
      case 'invalid':
        setFormSubmitting(false)
        const errors = watchedState.form.errors.url || []
        if (errors.length > 0) {
          showValidationError(rssUrlInput, errors[0])
        }
        break
        
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
        showFeedback(t('notifications.success'), 'success')
        watchedState.form.state = 'filling'
        break
        
      case 'error':
        setFormSubmitting(false)
        const error = watchedState.ui.error
        let errorMessage = t('notifications.error')
        if (error === 'networkError') {
          errorMessage = t('notifications.networkError')
        } else if (error === 'rssError') {
          errorMessage = t('notifications.rssError')
        }
        showFeedback(errorMessage, 'error')
        watchedState.form.state = 'filling'
        break
        
      default:
        break
    }
  })
  
  watchedState.feeds = onChange(watchedState.feeds, () => {
    updateFeedsList(watchedState.feeds)
  })
  
  watchedState.posts = onChange(watchedState.posts, () => {
    updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
      watchedState.openModal(post)
    })
  })
  
  watchedState.readPosts = onChange(watchedState.readPosts, () => {
    updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
      watchedState.openModal(post)
    })
  })
  
  watchedState.ui.error = onChange(watchedState.ui.error, (path, value) => {
  })
  
  watchedState.lng = onChange(watchedState.lng, (path, value) => {
    i18next.changeLanguage(value)
  })
  
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus()
  }, 100)
}

export {
  elements,
  showValidationError,
  clearValidationError,
  showFeedback,
  clearFeedback,
  setFormSubmitting,
  clearForm,
  updateFeedsList,
  updatePostsList,
  initView,
  updateUITexts,
}
