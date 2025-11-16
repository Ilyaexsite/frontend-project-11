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
      
      console.log('=== FORM SUBMISSION STARTED ===');
      
      const url = getFormUrl(state);
      const existingUrls = getFeeds(state).map(feed => feed.url);
      
      console.log('📝 URL to validate:', url);
      console.log('📋 Existing URLs:', existingUrls);
      
      setFormState(state, 'validating');
      clearError(state);
      
      try {
        console.log('🔍 Starting validation...');
        const validationResult = await validateRssUrl(url, existingUrls);
        console.log('✅ Validation result:', validationResult);
        
        if (!validationResult.isValid) {
          console.log('❌ Validation failed with errors:', validationResult.errors);
          setFormErrors(state, { url: validationResult.errors });
          setFormState(state, 'invalid');
          return;
        }
        
        console.log('🎯 Validation passed, setting state to submitting');
        setFormState(state, 'submitting');
        
        console.log('📥 Starting RSS load...');
        const rssData = await loadRssFeed(url);
        console.log('✅ RSS loaded successfully:', {
          title: rssData.title,
          description: rssData.description,
          postsCount: rssData.posts?.length
        });
        
        console.log('💾 Adding feed to state...');
        addFeed(state, rssData);
        addPosts(state, rssData.posts.map(post => ({
          ...post,
          feedId: rssData.url,
        })));
        
        console.log('🎉 Setting state to SUCCESS');
        setFormState(state, 'success');
        
      } catch (error) {
        console.error('💥 Error in form submission:', error);
        console.error('Error message:', error.message);
        setError(state, error.message);
        setFormState(state, 'error');
      }
    });
  }
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state);
    }
  });
};

document.addEventListener('DOMContentLoaded', app);
