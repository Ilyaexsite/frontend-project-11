import './styles/main.css';
import { initI18n, t } from './i18n.js';
import createState, {
  getFormUrl,
  getFeeds,
  getPostsByFeed,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm as clearFormState,
  addFeed,
  addPosts,
  addNewPosts,
  setNotification,
  setLanguage,
  setLoading,
  setError,
  clearError,
  setUpdating,
} from './state.js';
import { validateRssUrl } from './validation.js';
import { loadRssFeed, checkFeedUpdates } from './rss.js';
import { elements, initView } from './view.js';
import FeedUpdater from './updater.js';

// Глобальная переменная для обновлятеля фидов
let feedUpdater = null;

// Функция для обработки обновлений фидов
const handleFeedUpdate = (state) => async (feedUrl) => {
  const existingPosts = getPostsByFeed(state, feedUrl);
  
  try {
    const updateResult = await checkFeedUpdates(feedUrl, existingPosts);
    
    if (updateResult.newPosts.length > 0) {
      addNewPosts(state, updateResult.newPosts);
      
      // Показываем уведомление о новых постах
      setNotification(state, {
        message: `Добавлено ${updateResult.newPosts.length} новых постов из ${feedUrl}`,
        type: 'success',
      });
      
      console.log(`Added ${updateResult.newPosts.length} new posts from ${feedUrl}`);
    }
    
    return updateResult;
  } catch (error) {
    console.error(`Error in handleFeedUpdate for ${feedUrl}:`, error);
    return { newPosts: [], feedUrl, error: error.message };
  }
};

const app = async () => {
  await initI18n();
  
  const state = createState();
  
  // Инициализируем обновлятель фидов
  feedUpdater = new FeedUpdater(handleFeedUpdate(state), 5000);
  
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
        
        // Добавляем фид в обновлятель и перезапускаем его
        feedUpdater.addFeed({ url: rssData.url });
        feedUpdater.start();
        
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
  
  // Наблюдаем за изменениями списка фидов для обновления обновлятеля
  state.feeds = onChange(state.feeds, () => {
    if (feedUpdater) {
      feedUpdater.setFeeds(getFeeds(state));
      if (state.feeds.length > 0) {
        feedUpdater.start();
      } else {
        feedUpdater.stop();
      }
    }
  });
  
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
  
  // Запускаем обновлятель при инициализации, если есть фиды
  if (getFeeds(state).length > 0) {
    feedUpdater.setFeeds(getFeeds(state));
    feedUpdater.start();
  }
  
  // Останавливаем обновлятель при закрытии страницы
  window.addEventListener('beforeunload', () => {
    if (feedUpdater) {
      feedUpdater.stop();
    }
  });
};

document.addEventListener('DOMContentLoaded', app);
