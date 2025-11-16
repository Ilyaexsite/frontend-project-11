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
  console.log('🚀 App starting...');
  
  await initI18n();
  console.log('✅ i18n initialized');
  
  const state = createState();
  console.log('✅ State created');
  
  state.openModal = (post) => {
    state.readPosts.add(post.id);
  };
  
  initView(state, state);
  console.log('✅ View initialized');
  
  const { rssForm, rssUrlInput } = elements;
  
  console.log('📋 Main.js elements:', {
    form: !!rssForm,
    input: !!rssUrlInput,
    formId: rssForm?.id,
    inputId: rssUrlInput?.id
  });
  
  // Детальная проверка формы
  if (rssForm) {
    console.log('🔍 Form details:', {
      tagName: rssForm.tagName,
      id: rssForm.id,
      className: rssForm.className,
      action: rssForm.action,
      method: rssForm.method
    });
    
    console.log('✅ Adding submit handler to form');
    
    const formHandler = async (event) => {
      console.log('🎯 MAIN.JS FORM SUBMIT EVENT FIRED!');
      console.log('🔍 Event details:', {
        type: event.type,
        target: event.target.id,
        defaultPrevented: event.defaultPrevented
      });
      
      event.preventDefault();
      event.stopPropagation();
      console.log('✅ Event prevented and propagation stopped');
      
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
    };
    
    rssForm.addEventListener('submit', formHandler);
    console.log('✅ Submit handler added to form');
    
    // Проверим что обработчик действительно добавлен
    console.log('🔍 Form event listeners:', {
      submit: rssForm._listeners ? 'custom property' : 'need to check differently'
    });
    
  } else {
    console.error('❌ Form element not found!');
    // Попробуем найти форму другим способом
    const formById = document.getElementById('rss-form');
    const formByQuery = document.querySelector('#rss-form');
    console.log('🔍 Alternative form search:', {
      byId: !!formById,
      byQuery: !!formByQuery
    });
  }
  
  if (rssUrlInput) {
    console.log('✅ Adding input handler');
    rssUrlInput.addEventListener('input', (event) => {
      console.log('📝 Input changed:', event.target.value);
      setFormUrl(state, event.target.value.trim());
    });
  } else {
    console.error('❌ Input element not found!');
  }
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearFormState(state);
    }
  });
  
  console.log('✅ App initialization complete');
};

console.log('📜 Main.js module loaded');
document.addEventListener('DOMContentLoaded', app);
