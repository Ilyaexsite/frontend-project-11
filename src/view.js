import { t } from './i18n.js';
import onChange from 'on-change';

const elements = {
  rssForm: document.getElementById('rss-form'),
  rssUrlInput: document.getElementById('url-input'),
  submitButton: document.querySelector('button[type="submit"]'),
  feedsContainer: document.getElementById('feeds-container'),
  postsContainer: document.getElementById('posts-container'),
};

const createFeedbackElement = () => {
  let feedback = document.getElementById('feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'feedback';
    feedback.className = 'mb-3';
    const form = document.getElementById('rss-form');
    if (form) {
      form.parentNode.insertBefore(feedback, form);
    }
  }
  return feedback;
};

const showFeedback = (message, type = 'success') => {
  const feedback = createFeedbackElement();
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  feedback.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert" data-testid="feedback-message">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  console.log('Feedback shown:', message); // ДЕБАГ
};

const clearFeedback = () => {
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.innerHTML = '';
  }
};

const showValidationError = (input, message) => {
  input.classList.add('is-invalid');
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

const setFormSubmitting = (isSubmitting) => {
  const { submitButton, rssUrlInput } = elements;
  if (isSubmitting) {
    submitButton.disabled = true;
    submitButton.textContent = 'Добавление...';
    rssUrlInput.disabled = true;
  } else {
    submitButton.disabled = false;
    submitButton.textContent = 'Добавить';
    rssUrlInput.disabled = false;
  }
};

const clearForm = () => {
  const { rssUrlInput } = elements;
  rssUrlInput.value = '';
  clearValidationError(rssUrlInput);
  setTimeout(() => {
    rssUrlInput.focus();
  }, 100);
};

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) return;
  
  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Фиды</h2>
          <p class="card-text text-muted">Пока нет RSS потоков. Добавьте первый!</p>
        </div>
      </div>
    `;
    return;
  }
  
  const feedsHtml = feeds.map((feed) => `
    <div class="card mb-3">
      <div class="card-body">
        <h3 class="card-title h6">${feed.title}</h3>
        <p class="card-text">${feed.description}</p>
      </div>
    </div>
  `).join('');
  
  feedsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
        ${feedsHtml}
      </div>
    </div>
  `;
};

const updatePostsList = (posts, readPosts, onPreviewClick) => {
  const { postsContainer } = elements;
  if (!postsContainer) return;
  
  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="card border-0">
        <div class="card-body">
          <h2 class="card-title h4">Посты</h2>
          <p class="card-text text-muted">Пока нет постов. Новые посты будут появляться автоматически.</p>
        </div>
      </div>
    `;
    return;
  }
  
  const postsHtml = posts.map((post) => {
    const isRead = readPosts.has(post.id);
    const titleClass = isRead ? 'fw-normal' : 'fw-bold';
    
    return `
    <div class="list-group-item d-flex justify-content-between align-items-start border-0">
      <div class="ms-2 me-auto">
        <a href="${post.link}" class="${titleClass} text-dark text-decoration-none" target="_blank" rel="noopener noreferrer">
          ${post.title}
        </a>
      </div>
      <button type="button" class="btn btn-outline-primary btn-sm" data-post-id="${post.id}">
        Просмотр
      </button>
    </div>
    `;
  }).join('');
  
  postsContainer.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Посты</h2>
        <div class="list-group">
          ${postsHtml}
        </div>
      </div>
    </div>
  `;
  
  const viewButtons = postsContainer.querySelectorAll('button[data-post-id]');
  viewButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const postId = event.currentTarget.getAttribute('data-post-id');
      const post = posts.find(p => p.id === postId);
      if (post) {
        onPreviewClick(post);
      }
    });
  });
};

const initView = (state, watchedState) => {
  const { rssUrlInput } = elements;
  
  watchedState.form.state = onChange(watchedState.form.state, (path, value) => {
    console.log('Form state changed to:', value);
    
    switch (value) {
      case 'validating':
        setFormSubmitting(false);
        clearValidationError(rssUrlInput);
        clearFeedback();
        break;
        
      case 'invalid':
        setFormSubmitting(false);
        const errors = watchedState.form.errors?.url || [];
        if (errors.length > 0) {
          showValidationError(rssUrlInput, errors[0]);
        }
        break;
        
      case 'submitting':
        setFormSubmitting(true);
        clearValidationError(rssUrlInput);
        clearFeedback();
        break;
        
      case 'success':
        setFormSubmitting(false);
        clearForm();
        updateFeedsList(watchedState.feeds);
        updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
          watchedState.openModal(post);
        });
        showFeedback(t('rssLoaded'), 'success'); // ← ИСПРАВЛЕНО: используем перевод
        
        // НЕ сбрасываем состояние сразу - оставляем success для тестов
        setTimeout(() => {
          if (watchedState.form.state === 'success') {
            watchedState.form.state = 'filling';
          }
        }, 5000); // ← Сбрасываем через 5 секунд
        break;
        
      case 'error':
        setFormSubmitting(false);
        const error = watchedState.ui?.error;
        let errorMessage = t('errors.network');
        if (error === 'rssError') {
          errorMessage = t('errors.invalidRss');
        } else if (error) {
          errorMessage = error;
        }
        showFeedback(errorMessage, 'error');
        
        setTimeout(() => {
          if (watchedState.form.state === 'error') {
            watchedState.form.state = 'filling';
          }
        }, 5000);
        break;
        
      default:
        break;
    }
  });
  
  watchedState.feeds = onChange(watchedState.feeds, () => {
    updateFeedsList(watchedState.feeds);
  });
  
  watchedState.posts = onChange(watchedState.posts, () => {
    updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
      watchedState.openModal(post);
    });
  });
  
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus();
  }, 100);
};

export {
  elements,
  initView,
};
