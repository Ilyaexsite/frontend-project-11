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
  setNotification,
  setLanguage,
  setLoading,
  setError,
  clearError,
} from './state.js';
import { validateRssUrl } from './validation.js';
import { loadRssFeed } from './rss.js';
import { elements, initView } from './view.js';

const app = async () => {
  await initI18n();
  
  const state = createState();
  
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
        setLoading(state, true);
        
        // Загружаем и парсим RSS
        const rssData = await loadRssFeed(url);
        
        // Добавляем фид и посты в состояние
        addFeed(state, rssData);
        addPosts(state, rssData.posts.map(post => ({
          ...post,
          feedId: rssData.url,
        })));
        
        setFormState(state, 'success');
        setNotification(state, {
          message: t('notifications.success'),
          type: 'success',
        });
        
      } catch (error) {
        console.error('Error loading RSS:', error);
        
        let errorMessage = t('notifications.error');
        if (error.message === 'networkError') {
          errorMessage = t('notifications.networkError');
        } else if (error.message === 'rssError') {
          errorMessage = t('notifications.rssError');
        }
        
        setFormState(state, 'error');
        setNotification(state, {
          message: errorMessage,
          type: 'error',
        });
        setError(state, error.message);
      } finally {
        setLoading(state, false);
      }
    });
  }
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state);
    }
    
    if (event.ctrlKey && event.key === 'l') {
      const currentLng = i18next.language;
      const newLng = currentLng === 'ru' ? 'en' : 'ru';
      setLanguage(state, newLng);
    }
  });
};

document.addEventListener('DOMContentLoaded', app);
