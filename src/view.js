import { t } from './i18n.js';
import i18next from './i18n.js';
import onChange from 'on-change';

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
};

const updateUITexts = () => {
  const {
    appTitle,
    appDescription,
    exampleText,
    createdBy,
    rssUrlInput,
    submitButton,
  } = elements;

  if (appTitle) appTitle.textContent = t('app.title');
  if (appDescription) appDescription.textContent = t('app.description');
  if (exampleText) exampleText.innerHTML = t('form.example', { example: '<strong>https://lorem-rss.hexlet.app/feed</strong>' });
  if (createdBy) createdBy.textContent = t('app.createdBy');
  if (rssUrlInput) rssUrlInput.placeholder = t('form.placeholder');
  if (submitButton) submitButton.textContent = t('form.submit');
};

const showValidationError = (input, message) => {
  input.classList.add('is-invalid');
  
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'invalid-feedback';
  feedback.textContent = message;
  input.parentNode.appendChild(feedback);
};

const clearValidationError = (input) => {
  input.classList.remove('is-invalid');
  
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
};

const showSuccessValidation = (input) => {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
};

const clearSuccessValidation = (input) => {
  input.classList.remove('is-valid');
};

const showNotification = (message, type = 'success') => {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    setTimeout(() => {
      const alert = document.querySelector('.alert');
      if (alert) {
        alert.remove();
      }
    }, 5000);
  }
};

const setFormSubmitting = (isSubmitting) => {
  const { submitButton, rssUrlInput } = elements;
  
  if (isSubmitting) {
    submitButton.disabled = true;
    submitButton.textContent = t('form.submitting');
    rssUrlInput.disabled = true;
  } else {
    submitButton.disabled = false;
    submitButton.textContent = t('form.submit');
    rssUrlInput.disabled = false;
  }
};

const clearForm = () => {
  const { rssUrlInput } = elements;
  
  rssUrlInput.value = '';
  clearValidationError(rssUrlInput);
  clearSuccessValidation(rssUrlInput);
  
  setTimeout(() => {
    rssUrlInput.focus();
  }, 100);
};

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements;
  
  if (!feedsContainer) return;
  
  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <p class="fs-5">${t('feeds.empty')}</p>
      </div>
    `;
    return;
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
  `).join('');
  
  feedsContainer.innerHTML = `
    <h3 class="h3 mb-4 text-dark">Фиды</h3>
    ${feedsHtml}
  `;
};

const updatePostsList = (posts) => {
  const { postsContainer } = elements;
  
  if (!postsContainer) return;
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="fs-6">Пока нет постов</p>
      </div>
    `;
    return;
  }
  
  // Группируем посты по фидам
  const postsByFeed = posts.reduce((acc, post) => {
    if (!acc[post.feedId]) {
      acc[post.feedId] = [];
    }
    acc[post.feedId].push(post);
    return acc;
  }, {});
  
  const postsHtml = Object.entries(postsByFeed).map(([feedId, feedPosts]) => {
    const feedPostsHtml = feedPosts.map((post) => `
      <div class="mb-3">
        <a href="${post.link}" class="post-link text-decoration-none" target="_blank" rel="noopener noreferrer">
          <div class="card border-0 bg-light-hover">
            <div class="card-body py-3">
              <h6 class="card-title mb-2 text-dark">${post.title}</h6>
              <p class="card-text text-muted small mb-0">${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}</p>
            </div>
          </div>
        </a>
      </div>
    `).join('');
    
    return `
      <div class="mb-4">
        ${feedPostsHtml}
      </div>
    `;
  }).join('');
  
  postsContainer.innerHTML = `
    <h3 class="h3 mb-4 text-dark">Посты</h3>
    ${postsHtml}
  `;
};

const initView = (state, watchedState) => {
  updateUITexts();
  
  i18next.on('languageChanged', () => {
    updateUITexts();
    updateFeedsList(watchedState.feeds);
    updatePostsList(watchedState.posts);
  });
  
  const { rssUrlInput } = elements;
  
  watchedState.form.state = onChange(watchedState.form.state, (path, value) => {
    switch (value) {
      case 'validating':
        setFormSubmitting(false);
        clearValidationError(rssUrlInput);
        break;
        
      case 'invalid':
        setFormSubmitting(false);
        const errors = watchedState.form.errors.url || [];
        if (errors.length > 0) {
          showValidationError(rssUrlInput, errors[0]);
        }
        break;
        
      case 'submitting':
        setFormSubmitting(true);
        clearValidationError(rssUrlInput);
        showSuccessValidation(rssUrlInput);
        break;
        
      case 'success':
        setFormSubmitting(false);
        clearForm();
        updateFeedsList(watchedState.feeds);
        updatePostsList(watchedState.posts);
        showNotification(t('notifications.success'), 'success');
        watchedState.form.state = 'filling';
        break;
        
      case 'error':
        setFormSubmitting(false);
        showNotification(t('notifications.error'), 'error');
        watchedState.form.state = 'filling';
        break;
        
      default:
        break;
    }
  });
  
  watchedState.feeds = onChange(watchedState.feeds, () => {
    updateFeedsList(watchedState.feeds);
  });
  
  watchedState.posts = onChange(watchedState.posts, () => {
    updatePostsList(watchedState.posts);
  });
  
  watchedState.ui.notification = onChange(watchedState.ui.notification, (path, value) => {
    if (value) {
      showNotification(value.message, value.type);
    }
  });
  
  watchedState.lng = onChange(watchedState.lng, (path, value) => {
    i18next.changeLanguage(value);
  });
  
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus();
  }, 100);
};

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
  initView,
  updateUITexts,
};
