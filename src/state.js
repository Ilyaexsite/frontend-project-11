import onChange from 'on-change'

const initialState = {
  lng: 'ru',
  form: {
    state: 'filling',
    fields: {
      url: '',
    },
    errors: {},
  },
  feeds: [],
  posts: [],
  readPosts: new Set(),
  ui: {
    error: null,
  },
}

const createState = (initial = initialState) => {
  return onChange(initial, (path, value, previousValue) => {
    if (path === 'form.state') {
      console.log('Form state changed:', value)
    }
  })
}

const getFormState = (state) => state.form.state
const getFormUrl = (state) => state.form.fields.url
const getFormErrors = (state) => state.form.errors
const getFeeds = (state) => state.feeds
const getPosts = (state) => state.posts
const getError = (state) => state.ui.error
const getReadPosts = (state) => state.readPosts

const setFormState = (state, newState) => {
  console.log('🔄 Setting form state from', state.form.state, 'to', newState)
  state.form.state = newState
}

const setFormUrl = (state, url) => {
  state.form.fields.url = url
}

const setFormErrors = (state, errors) => {
  state.form.errors = errors
}

const clearForm = (state) => {
  state.form.fields.url = ''
  state.form.errors = {}
  state.form.state = 'filling'
}

const addFeed = (state, feedData) => {
  console.log('💾 Adding feed to state:', feedData)
  const newFeed = {
    id: `feed-${Date.now()}`,
    url: feedData.url,
    title: feedData.title, 
    description: feedData.description,
  }
  state.feeds.push(newFeed)
  console.log('✅ Feed added, total feeds:', state.feeds.length)
}

const addPosts = (state, postsData) => {
  console.log('📝 Adding posts to state:', postsData.length)
  state.posts = [...state.posts, ...postsData]
  console.log('✅ Posts added, total posts:', state.posts.length)
}

const setError = (state, error) => {
  state.ui.error = error
}

const clearError = (state) => {
  state.ui.error = null
}

export {
  getFormState,
  getFormUrl,
  getFormErrors,
  getFeeds,
  getPosts,
  getError,
  getReadPosts,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm,
  addFeed,
  addPosts,
  setError,
  clearError,
}

export default createState
