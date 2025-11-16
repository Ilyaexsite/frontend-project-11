import { t } from './i18n.js';

// Создаем объект с геттерами чтобы всегда получать актуальные элементы
const elements = {
  get rssForm() { return document.getElementById('rss-form'); },
  get rssUrlInput() { return document.getElementById('url-input'); },
  get submitButton() { return document.querySelector('button[type="submit"]'); },
  get feedsContainer() { return document.getElementById('feeds-container'); },
  get postsContainer() { return document.getElementById('posts-container'); },
};

// Простой наблюдатель состояний вместо onChange
const createStateObserver = (state, callback) => {
  let currentState = state;
  
  return {
    setState(newState) {
      if (newState !== currentState) {
        const oldState = currentState;
        currentState = newState;
        callback(oldState, newState);
      }
    },
    getState() {
      return currentState;
    }
  };
};

// Функция для проверки что элементы найдены
const checkElements = () => {
  console.log('🔍 Checking elements:', {
    form: !!elements.rssForm,
    input: !!elements.rssUrlInput,
    button: !!elements.submitButton,
    feeds: !!elements.feedsContainer,
    posts: !!elements.postsContainer
  });
  return elements.rssForm && elements.rssUrlInput;
};

const createFeedbackElement = () => {
  let feedback = document.getElementById('feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'feedback';
    feedback.className = 'mb-3';
    const form = elements.rssForm;
    if (form && form.parentNode) {
      form.parentNode.insertBefore(feedback, form);
      console.log('✅ Feedback element created and inserted before form');
    } else {
      console.error('❌ Form or form parent not found for feedback insertion');
    }
  }
  return feedback;
};

const showFeedback = (message, type = 'success') => {
  console.log(`🎯 showFeedback called: "${message}", type: ${type}`);
  
  const feedback = createFeedbackElement();
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  
  feedback.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert" data-testid="success-message">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  // Проверяем что сообщение действительно в DOM
  setTimeout(() => {
    const successMessage = document.querySelector('[data-testid="success-message"]');
    console.log('🔍 Success message in DOM:', !!successMessage);
    console.log('📝 Success message text:', successMessage?.textContent);
    console.log('📍 Success message parent:', successMessage?.parentElement);
  }, 100);
};

const clearFeedback = () => {
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.innerHTML = '';
  }
};

const showValidationError = (input, message) => {
  if (!input) {
    console.error('❌ Input element not found for validation error');
    return;
  }
  input.classList.add('is-invalid');
  const feedback = document.createElement('div');
  feedback.className = 'invalid-feedback';
  feedback.textContent = message;
  input.parentNode.appendChild(feedback);
};

const clearValidationError = (input) => {
  if (!input) return;
  input.classList.remove('is-invalid');
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
};

const setFormSubmitting = (isSubmitting) => {
  const { submitButton, rssUrlInput } = elements;
  if (!submitButton || !rssUrlInput) {
    console.error('❌ Form elements not found for setFormSubmitting');
    return;
  }
  
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
  if (!rssUrlInput) {
    console.error('❌ Input element not found for clearForm');
    return;
  }
  rssUrlInput.value = '';
  clearValidationError(rssUrlInput);
  setTimeout(() => {
    if (rssUrlInput) rssUrlInput.focus();
  }, 100);
};

const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) {
    console.error('❌ Feeds container not found');
    return;
  }
  
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
  if (!postsContainer) {
    console.error('❌ Posts container not found');
    return;
  }
  
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
  console.log('🚀 View initializing...');
  
  try {
    // Проверяем элементы
    checkElements();
    
    const { rssUrlInput } = elements;
    
    if (!rssUrlInput) {
      console.error('❌ Input element not found in initView');
      return;
    }
    
    console.log('✅ View initialized with elements');
    
    // Простой наблюдатель за состоянием формы
    const formStateObserver = createStateObserver(watchedState.form.state, (oldState, newState) => {
      console.log('🔄 Form state changed from', oldState, 'to', newState);
      
      switch (newState) {
        case 'validating':
          console.log('🔍 Validating form...');
          setFormSubmitting(false);
          clearValidationError(rssUrlInput);
          clearFeedback();
          break;
          
        case 'invalid':
          console.log('❌ Form invalid');
          setFormSubmitting(false);
          const errors = watchedState.form.errors?.url || [];
          console.log('Validation errors:', errors);
          if (errors.length > 0 && rssUrlInput) {
            showValidationError(rssUrlInput, errors[0]);
          }
          break;
          
        case 'submitting':
          console.log('⏳ Submitting form...');
          setFormSubmitting(true);
          clearValidationError(rssUrlInput);
          clearFeedback();
          break;
          
        case 'success':
          console.log('✅ Form success - showing feedback');
          setFormSubmitting(false);
          clearForm();
          updateFeedsList(watchedState.feeds);
          updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
            watchedState.openModal(post);
          });
          showFeedback(t('rssLoaded'), 'success');
          
          // НЕ сбрасываем состояние сразу для тестов
          setTimeout(() => {
            if (watchedState.form.state === 'success') {
              watchedState.form.state = 'filling';
            }
          }, 10000);
          break;
          
          case 'error':
            console.log('💥 Form error');
            setFormSubmitting(false);
            const error = watchedState.ui?.error;
            console.log('Error details:', error);
            let errorMessage = t('errors.network'); // Всегда используем перевод
            if (error === 'rssError') {
              errorMessage = t('errors.invalidRss');
            } else if (error && error.includes('Failed to fetch')) {
              errorMessage = t('errors.network'); // Для network ошибок
            } else if (error) {
              errorMessage = error; // Оригинальное сообщение как fallback
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
    
    // Перехватываем изменения состояния формы
    const originalFormStateSetter = Object.getOwnPropertyDescriptor(watchedState.form, 'state').set;
    Object.defineProperty(watchedState.form, 'state', {
      get() {
        return formStateObserver.getState();
      },
      set(newState) {
        formStateObserver.setState(newState);
        if (originalFormStateSetter) {
          originalFormStateSetter.call(watchedState.form, newState);
        }
      }
    });
    
    // Простые наблюдатели для feeds и posts
    let currentFeeds = [...watchedState.feeds];
    let currentPosts = [...watchedState.posts];
    
    // Проверяем изменения каждые 100ms
    setInterval(() => {
      if (watchedState.feeds.length !== currentFeeds.length) {
        console.log('📰 Feeds updated:', watchedState.feeds.length);
        updateFeedsList(watchedState.feeds);
        currentFeeds = [...watchedState.feeds];
      }
      
      if (watchedState.posts.length !== currentPosts.length) {
        console.log('📝 Posts updated:', watchedState.posts.length);
        updatePostsList(watchedState.posts, watchedState.readPosts, (post) => {
          watchedState.openModal(post);
        });
        currentPosts = [...watchedState.posts];
      }
    }, 100);
    
    setTimeout(() => {
      if (rssUrlInput) rssUrlInput.focus();
    }, 100);
    
    console.log('✅ View initialization complete');
    
  } catch (error) {
    console.error('💥 Error in initView:', error);
    console.error('Error stack:', error.stack);
  }
};

export {
  elements,
  initView,
  checkElements
};
