import './styles/main.css';
import createState, {
  getFormUrl,
  getFeeds,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  setNotification,
} from './state.js';
import validateRssUrl from './validation.js';
import { elements, initView } from './view.js';

// Инициализация приложения
const app = () => {
  // Создаем состояние приложения
  const state = createState();
  
  // Инициализируем View с наблюдаемым состоянием
  initView(state, state);
  
  const { rssForm, rssUrlInput } = elements;
  
  // Обработчик изменения input
  rssUrlInput.addEventListener('input', (event) => {
    setFormUrl(state, event.target.value.trim());
  });
  
  // Обработчик отправки формы
  rssForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const url = getFormUrl(state);
    const existingUrls = getFeeds(state);
    
    // Начинаем валидацию
    setFormState(state, 'validating');
    
    validateRssUrl(url, existingUrls)
      .then((validationResult) => {
        if (!validationResult.isValid) {
          setFormErrors(state, { url: validationResult.errors });
          setFormState(state, 'invalid');
          return;
        }
        
        // Валидация прошла успешно - начинаем добавление
        setFormState(state, 'submitting');
        
        // Имитируем добавление RSS (в реальном приложении здесь будет запрос к бэкенду)
        return new Promise((resolve) => {
          setTimeout(() => {
            addFeed(state, url);
            resolve();
          }, 1500);
        });
      })
      .then(() => {
        // Успешное добавление
        setFormState(state, 'success');
        setNotification(state, {
          message: 'RSS успешно добавлен',
          type: 'success',
        });
      })
      .catch((error) => {
        // Ошибка при добавлении
        console.error('Error adding RSS:', error);
        setFormState(state, 'error');
        setNotification(state, {
          message: 'Ошибка при добавлении RSS',
          type: 'error',
        });
      });
  });
  
  // Обработчик сброса формы по Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state);
    }
  });
};

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', app);
