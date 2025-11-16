import './styles/main.css';
import { initI18n, t } from './i18n.js';
import createState, {
  getFormUrl,
  getFeeds,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  addPosts,
  setError,
  clearError,
} from './state.js';
import { validateRssUrl } from './validation.js';
import { loadRssFeed } from './rss.js';
import { elements, initView } from './view.js';

const app = async () => {
  await initI18n();
  
  const state = createState();
  
  state.openModal = (post) => {
    state.readPosts.add(post.id);
  };
  
  initView(state, state);
  
  const { rssForm, rssUrlInput } = elements;
  
  if (rssUrlInput) {
    rssUrlInput.addEventListener('input', (event) => {
      setFormUrl(state, event.target.value.trim());
    });
  }
  
  if (rssForm) {
    rssForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const url = getFormUrl(state);
      const existingUrls = getFeeds(state).map(feed => feed.url);
      
      setFormState(state, 'validating');
      clearError(state);
      
      try {
        const validationResult = await validateRssUrl(url, existingUrls);
        
        if (!validationResult.isValid) {
          setFormErrors(state, { url: validationResult.errors });
          setFormState(state, 'invalid');
          return;
        }
        
        setFormState(state, 'submitting');
        
        const rssData = await loadRssFeed(url);
        
        addFeed(state, rssData);
        addPosts(state, rssData.posts.map(post => ({
          ...post,
          feedId: rssData.url,
        })));
        
        setFormState(state, 'success');
        showSuccessMessage();
        
      } catch (error) {
        console.error('Error loading RSS:', error);
        setError(state, error.message);
        setFormState(state, 'error');
      }
    });
  }
  
  function showSuccessMessage() {
    // Удаляем предыдущие сообщения
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // Создаем сообщение об успехе
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.textContent = t('rssLoaded');
    successAlert.setAttribute('data-testid', 'success-message');
    
    // Вставляем перед формой
    const formContainer = rssForm?.parentNode;
    if (formContainer) {
      formContainer.insertBefore(successAlert, rssForm);
      
      // Очищаем форму
      if (rssUrlInput) {
        rssUrlInput.value = '';
      }
      
      // Сбрасываем состояние через 5 секунд
      setTimeout(() => {
        if (successAlert.parentNode) {
          successAlert.remove();
        }
        setFormState(state, 'filling');
        clearFormState(state);
      }, 5000);
    }
  }
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state);
    }
  });
};

document.addEventListener('DOMContentLoaded', app);
