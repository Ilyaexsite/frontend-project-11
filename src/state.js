import onChange from 'on-change';


const initialState = {
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

export const getFormState = (state) => state.form.state
export const getFormUrl = (state) => state.form.fields.url
export const getFormErrors = (state) => state.form.errors
export const getFeeds = (state) => state.feeds
export const getNotification = (state) => state.ui.notification

export const setFormState = (state, newState) => {
  state.form.state = newState;
}

export const setFormUrl = (state, url) => {
  state.form.fields.url = url
}

export const setFormErrors = (state, errors) => {
  state.form.errors = errors
}

export const clearForm = (state) => {
  state.form.fields.url = ''
  state.form.errors = {}
  state.form.state = 'filling'
}

export const addFeed = (state, feedUrl) => {
  state.feeds.push(feedUrl)
}

export const setNotification = (state, notification) => {
  state.ui.notification = notification
}

export const clearNotification = (state) => {
  state.ui.notification = null
}

export default createState
