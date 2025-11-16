import onChange from 'on-change'
import { t } from './i18n.js'

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
  readPosts: new Set(), // Храним ID прочитанных постов
  ui: {
    notification: null,
    loading: false,
    error: null,
    updating: false,
    modal: {
      isOpen: false,
      post: null,
    },
  },
}

const createState = (initial = initialState) => {
  const state = onChange(initial, (path, value, previousValue) => {
    console.log(`State changed: ${path}`, value)
  })

  return state
}

// Геттеры
const getFormState = (state) => state.form.state
const getFormUrl = (state) => state.form.fields.url
const getFormErrors = (state) => state.form.errors
const getFeeds = (state) => state.feeds
const getPosts = (state) => state.posts
const getPostsByFeed = (state, feedUrl) => state.posts.filter(post => post.feedId === feedUrl)
const getNotification = (state) => state.ui.notification
const getLanguage = (state) => state.lng
const getLoading = (state) => state.ui.loading
const getError = (state) => state.ui.error
const getUpdating = (state) => state.ui.updating
const getModal = (state) => state.ui.modal
const getReadPosts = (state) => state.readPosts
const isPostRead = (state, postId) => state.readPosts.has(postId)

// Сеттеры
const setFormState = (state, newState) => {
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
  const newFeed = {
    id: `feed-${Date.now()}`,
    url: feedData.url,
    title: feedData.feed.title,
    description: feedData.feed.description,
  }
  
  state.feeds.push(newFeed)
}

const addPosts = (state, postsData) => {
  const newPosts = postsData.map(post => ({
    ...post,
    feedId: postsData.feedId || post.feedId,
  }))
  
  state.posts = [...state.posts, ...newPosts]
}

const addNewPosts = (state, newPosts) => {
  state.posts = [...state.posts, ...newPosts]
}

const setNotification = (state, notification) => {
  state.ui.notification = notification
}

const clearNotification = (state) => {
  state.ui.notification = null
}

const setLanguage = (state, lng) => {
  state.lng = lng
}

const setLoading = (state, loading) => {
  state.ui.loading = loading
}

const setError = (state, error) => {
  state.ui.error = error
}

const clearError = (state) => {
  state.ui.error = null
}

const setUpdating = (state, updating) => {
  state.ui.updating = updating
}

const openModal = (state, post) => {
  state.ui.modal = {
    isOpen: true,
    post,
  }
  // Помечаем пост как прочитанный при открытии модального окна
  markPostAsRead(state, post.id)
}

const closeModal = (state) => {
  state.ui.modal = {
    isOpen: false,
    post: null,
  }
}

const markPostAsRead = (state, postId) => {
  state.readPosts.add(postId)
}

export {
  getFormState,
  getFormUrl,
  getFormErrors,
  getFeeds,
  getPosts,
  getPostsByFeed,
  getNotification,
  getLanguage,
  getLoading,
  getError,
  getUpdating,
  getModal,
  getReadPosts,
  isPostRead,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm,
  addFeed,
  addPosts,
  addNewPosts,
  setNotification,
  clearNotification,
  setLanguage,
  setLoading,
  setError,
  clearError,
  setUpdating,
  openModal,
  closeModal,
  markPostAsRead,
}

export default createState
