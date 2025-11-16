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
  ui: {
    notification: null,
  },
}

const createState = (initial = initialState) => {
  const state = onChange(initial, (path, value, previousValue) => {
    console.log(`State changed: ${path}`, value)
  })

  return state
}

const getFormState = (state) => state.form.state
const getFormUrl = (state) => state.form.fields.url
const getFormErrors = (state) => state.form.errors
const getFeeds = (state) => state.feeds
const getPosts = (state) => state.posts
const getNotification = (state) => state.ui.notification
const getLanguage = (state) => state.lng

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

const addFeed = (state, feedUrl) => {
  state.feeds.push({
    url: feedUrl,
    title: feedUrl,
    id: Date.now().toString(),
  })
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

const addPosts = (state, newPosts) => {
  state.posts = [...state.posts, ...newPosts]
}

export {
  getFormState,
  getFormUrl,
  getFormErrors,
  getFeeds,
  getPosts,
  getNotification,
  getLanguage,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm,
  addFeed,
  setNotification,
  clearNotification,
  setLanguage,
  addPosts,
}

export default createState
