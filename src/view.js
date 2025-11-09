// Селекторы элементов
const elements = {
  rssForm: document.getElementById('rss-form'),
  rssUrlInput: document.getElementById('rss-url'),
  submitButton: document.querySelector('button[type="submit"]'),
  feedbackContainer: document.getElementById('feedback-container'),
  feedsContainer: document.getElementById('feeds-container'),
};

// Валидация UI
const showValidationError = (input, message) => {
  input.classList.add('is-invalid');
  
  // Удаляем предыдущие сообщения об ошибках
  const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  // Добавляем новое сообщение об ошибке
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

// Уведомления
const showNotification = (message, type = 'success') => {
  // Удаляем предыдущие уведомления
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
  
  const container = document.querySelector('.container-fluid');
  if (container) {
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      const alert = document.querySelector('.alert');
      if (alert) {
        alert.remove();
      }
    }, 5000);
  }
};

// Состояния формы
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
  clearSuccessValidation(rssUrlInput);
  
  // Возвращаем фокус на input
  setTimeout(() => {
    rssUrlInput.focus();
  }, 100);
};

// Обновление списка фидов
const updateFeedsList = (feeds) => {
  const { feedsContainer } = elements;
  
  if (!feedsContainer) return;
  
  if (feeds.length === 0) {
    feedsContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <p>Пока нет RSS потоков. Добавьте первый!</p>
      </div>
    `;
    return;
  }
  
  const feedsHtml = feeds.map((feedUrl, index) => `
    <div class="card mb-3 fade-in">
      <div class="card-body">
        <h5 class="card-title d-flex align-items-center">
          <span class="badge bg-primary me-2">${index + 1}</span>
          ${feedUrl}
        </h5>
        <p class="card-text text-success">
          ✓ RSS поток успешно добавлен
        </p>
      </div>
    </div>
  `).join('');
  
  feedsContainer.innerHTML = feedsHtml;
};

// Инициализация View
const initView = (state, watchedState) => {
  const { rssUrlInput } = elements;
  
  // Наблюдаем за изменениями состояния
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
        showNotification('RSS успешно добавлен', 'success');
        watchedState.form.state = 'filling';
        break;
        
      case 'error':
        setFormSubmitting(false);
        showNotification('Ошибка при добавлении RSS', 'error');
        watchedState.form.state = 'filling';
        break;
        
      default:
        break;
    }
  });
  
  watchedState.feeds = onChange(watchedState.feeds, () => {
    updateFeedsList(watchedState.feeds);
  });
  
  watchedState.ui.notification = onChange(watchedState.ui.notification, (path, value) => {
    if (value) {
      showNotification(value.message, value.type);
    }
  });
  
  // Фокус на input при загрузке
  setTimeout(() => {
    rssUrlInput.focus()
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
  initView,
}
