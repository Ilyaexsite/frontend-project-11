import { t } from './i18n.js'
import i18next from './i18n.js'
import onChange from 'on-change'

const elements = {
  rssForm: document.getElementById('rss-form'),
  rssUrlInput: document.getElementById('rss-url'),
  submitButton: document.querySelector('button[type="submit"]'),
  feedsContainer: document.getElementById('feeds-container'),
  postsContainer: document.getElementById('posts-container'),
  appTitle: document.querySelector('h1'),
  appDescription: document.querySelector('.lead'),
  exampleText: document.querySelector('.form-text'),
  createdBy: document.querySelector('.text-muted.small'),
  updateStatus: document.getElementById('update-status'),
  modal: document.getElementById('post-modal'),
}

const createUpdateStatusElement = () => {
  if (!elements.updateStatus) {
    const statusElement = document.createElement('div')
    statusElement.id = 'update-status'
    statusElement.className = 'text-center mb-3'
    document.querySelector('.container').insertBefore(statusElement, document.querySelector('.row'))
    elements.updateStatus = statusElement
  }
}

const createModalElement = () => {
  if (!elements.modal) {
    const modalHtml = `
      <div class="modal fade" id="post-modal" tabindex="-1" aria-labelledby="post-modal-label" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="post-modal-label">Просмотр поста</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="modal-content">
                <!-- Контент модального окна будет заполняться динамически -->
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
              <a href="#" class="btn btn-primary" id="modal-full-article" target="_blank" rel="noopener noreferrer">Читать полностью</a>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modalHtml)
    elements.modal = document.getElementById('post-modal')
  }
}

const updateUITexts = () => {
  const {
    appTitle,
    appDescription,
    exampleText,
    createdBy,
    rssUrlInput,
    submitButton,
  } = elements

  if (appTitle) appTitle.textContent = t('app.title')
  if (appDescription) appDescription.textContent = t('app.description')
  if (exampleText) exampleText.innerHTML = t('form.example', { example: '<strong>https://lorem-rss.hexlet.app/feed</strong>' })
  if (createdBy) createdBy.textContent = t('app.createdBy')
  if (rssUrlInput) rssUrlInput.placeholder = t('form.placeholder')
  if (submitButton) submitButton.textContent = t('form.submit')
}

const showUpdateStatus = (message, type = 'info') => {
  createUpdateStatusElement()
  
  const statusClass = type === 'error' ? 'text-danger' : 'text-success'
  elements.updateStatus.innerHTML = `
    <small class="${statusClass}">
      <i class="bi bi-arrow-repeat"></i> ${message}
    </small>
  `
}

const clearUpdateStatus = () => {
  if (elements.updateStatus) {
    elements.updateStatus.innerHTML = ''
  }
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

const showSuccessValidation = (input) => {
  input.classList.remove('is-invalid')
  input.classList.add('is-valid')
}

const clearSuccessValidation = (input) => {
  input.classList.remove('is-valid')
}

const showNotification = (message, type = 'success') => {
  const existingAlert = document.querySelector('.alert')
  if (existingAlert) {
    existingAlert.remove()
  }
  
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'
  const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `
  
  const container = document.querySelector('.container')
  if (container) {
    container.insertAdjacentHTML('afterbegin', alertHtml)
    
    setTimeout(() => {
      const alert = document.querySelector('.alert')
      if (alert) {
        alert.remove()
      }
    }, 5000)
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
  clearSuccessValidation(rssUrlInput)
  
  setTimeout(() => {
    rssUrlInput.focus()
  }, 100)
}

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements
  
  if (!feedsContainer) return
  
  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <p class="fs-5">${t('feeds.empty')}</p>
      </div>
    `
    return
  }
  
  const feedsHtml = feeds.map((feed) => `
    <div class="feed-card card mb-4 fade-in">
      <div class="card-body p-4">
        <h5 class="card-title mb-3 fs-5 text-primary">${feed.title}</h5>
        <p class="card-text text-muted mb-3">${feed.description}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">${feed.url}</small>
          <span class="badge bg-success">✓ Добавлен</span>
        </div>
      </div>
    </div>
  `).join('')
  
  feedsContainer.innerHTML = `
    <h3 class="h3 mb-4 text-dark">Фиды</h3>
    ${feedsHtml}
  `
}

const updatePostsList = (posts, readPosts, onPreviewClick) => {
  const { postsContainer } = elements
  
  if (!postsContainer) return
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="fs-6">Пока нет постов. Новые посты будут появляться автоматически.</p>
      </div>
    `
    return
  }
  
  const sortedPosts = [...posts].reverse()
  
  const postsHtml = sortedPosts.map((post) => {
    const isRead = readPosts.has(post.id)
    const titleClass = isRead ? 'fw-normal' : 'fw-bold'
    
    return `
    <div class="mb-3 fade-in">
      <div class="card border-0 bg-light-hover">
        <div class="card-body py-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1 me-3">
              <h6 class="card-title mb-2 text-dark ${titleClass}">${post.title}</h6>
              <p class="card-text text-muted small mb-2">${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}</p>
              <small class="text-muted">Из: ${post.feedId}</small>
            </div>
            <div class="d-flex flex-column gap-2">
              <a href="${post.link}" class="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <button type="button" class="btn btn-outline-secondary btn-sm preview-btn" data-post-id="${post.id}">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
  }).join('')
  
  postsContainer.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="h3 text-dark mb-0">Посты</h3>
      <small class="text-muted">Автообновление каждые 5 секунд</small>
    </div>
    ${postsHtml}
  `
  
  // Добавляем обработчики для кнопок предпросмотра
  const previewButtons = postsContainer.querySelectorAll('.preview-btn')
  previewButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const postId = event.currentTarget.getAttribute('data-post-id')
      const post = posts.find(p => p.id === postId)
      if (post) {
        onPreviewClick(post)
      }
    })
  })
}

const updateModal = (modalState) => {
  const { modal } = elements
  
  if (!modal) return
  
  const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal)
  
  if (modalState.isOpen && modalState.post) {
    // Заполняем контент модального окна
    const modalContent = document.getElementById('modal-content')
    const fullArticleLink = document.getElementById('modal-full-article')
    
    if (modalContent && fullArticleLink) {
      modalContent.innerHTML = `
        <h4 class="mb-3">${modalState.post.title}</h4>
        <div class="post-description">
          ${modalState.post.description || '<p class="text-muted">Описание отсутствует</p>'}
        </div>
      `
      fullArticleLink.href = modalState.post.link
    }
    
    // Показываем модальное окно
    modalInstance.show()
  } else {
    // Скрываем модальное окно
    modalInstance.hide()
  }
}

const initView = (state, watchedState) => {
  updateUITexts()
  createUpdateStatusElement()
  createModalElement()
  
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
        showSuccessValidation(rssUrlInput)
        break
        
      case 'success':
        setFormSubmitting(false)
        clearForm()
        updateFeedsList(watchedState.feeds)
        updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
          watchedState.openModal(post)
        })
        showNotification(t('notifications.success'), 'success')
        watchedState.form.state = 'filling'
        break
        
      case 'error':
        setFormSubmitting(false)
        showNotification(t('notifications.error'), 'error')
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
  
  watchedState.ui.notification = onChange(watchedState.ui.notification, (path, value) => {
    if (value) {
      showNotification(value.message, value.type)
    }
  })
  
  watchedState.ui.modal = onChange(watchedState.ui.modal, (path, value) => {
    updateModal(value)
  })
  
  watchedState.lng = onChange(watchedState.lng, (path, value) => {
    i18next.changeLanguage(value)
  })
  
  // Обработчик закрытия модального окна
  if (elements.modal) {
    elements.modal.addEventListener('hidden.bs.modal', () => {
      watchedState.closeModal()
    })
  }
  
  showUpdateStatus('Автообновление включено')
  
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus()
  }, 100)
}

export {
  elements,
  showValidationError,
  clearValidationError,
  showSuccessValidation,
  clearSuccessValidation,
  showNotification,
  setFormSubmitting,
  clearForm,
  updateFeedsList,
  updatePostsList,
  updateModal,
  initView,
  updateUITexts,
  showUpdateStatus,
  clearUpdateStatus,
}
