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
  
  try {
    await initI18n();
    console.log('✅ i18n initialized');
    
    const state = createState();
    console.log('✅ State created');
    
    state.openModal = (post) => {
      console.log('🔄 Opening modal for post:', post.title);
      
      // Добавляем пост в прочитанные
      state.readPosts.add(post.id);
      
      // Заполняем модальное окно
      const modalBody = document.getElementById('modalBodyContent');
      const modalTitle = document.getElementById('postModalLabel');
      const readMoreLink = document.getElementById('modalReadMore');
      
      if (modalBody && modalTitle && readMoreLink) {
        modalBody.innerHTML = `
          <h6>${post.title}</h6>
          <p>${post.description || 'Описание недоступно'}</p>
          <small class="text-muted">Цель: Научиться извлекать из дерева необходимые данные</small>
        `;
        modalTitle.textContent = post.title;
        readMoreLink.href = post.link;
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('postModal'));
        modal.show();
      } else {
        console.error('❌ Modal elements not found');
      }
    };
    
    console.log('🔄 Calling initView...');
    initView(state, state);
    console.log('✅ View initialized');
    
    // ДОБАВЛЕНО: Ждем немного чтобы элементы точно были в DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('📋 Main.js elements after initView:', {
      form: !!elements.rssForm,
      input: !!elements.rssUrlInput,
      formId: elements.rssForm?.id,
      inputId: elements.rssUrlInput?.id
    });
    
    if (elements.rssUrlInput) {
      console.log('✅ Adding input handler');
      elements.rssUrlInput.addEventListener('input', (event) => {
        console.log('📝 Input changed:', event.target.value);
        setFormUrl(state, event.target.value.trim());
      });
    } else {
      console.error('❌ Input element not found!');
    }
    
    if (elements.rssForm) {
      console.log('✅ Adding submit handler to form');
      
      const formHandler = async (event) => {
        console.log('🎯 MAIN.JS FORM SUBMIT EVENT FIRED!');
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
      };
      
      elements.rssForm.addEventListener('submit', formHandler);
      console.log('✅ Submit handler added to form');
      
    } else {
      console.error('❌ Form element not found!');
      // Попробуем найти форму заново
      const formById = document.getElementById('rss-form');
      console.log('🔍 Form search by ID:', !!formById);
    }
    
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        clearFormState(state);
      }
    });
    
    console.log('✅ App initialization complete');
    
  } catch (error) {
    console.error('💥 Error in app initialization:', error);
    console.error('Error stack:', error.stack);
  }
};

console.log('📜 Main.js module loaded');
document.addEventListener('DOMContentLoaded', app);
