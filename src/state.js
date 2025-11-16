import onChange from 'on-change';
import { t } from './i18n.js';

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
    loading: false,
    error: null,
  },
};

const createState = (initial = initialState) => {
  const state = onChange(initial, (path, value, previousValue) => {
    console.log(`State changed: ${path}`, value);
  });

  return state;
};

// Геттеры
const getFormState = (state) => state.form.state;
const getFormUrl = (state) => state.form.fields.url;
const getFormErrors = (state) => state.form.errors;
const getFeeds = (state) => state.feeds;
const getPosts = (state) => state.posts;
const getNotification = (state) => state.ui.notification;
const getLanguage = (state) => state.lng;
const getLoading = (state) => state.ui.loading;
const getError = (state) => state.ui.error;

// Сеттеры
const setFormState = (state, newState) => {
  state.form.state = newState;
};

const setFormUrl = (state, url) => {
  state.form.fields.url = url;
};

const setFormErrors = (state, errors) => {
  state.form.errors = errors;
};

const clearForm = (state) => {
  state.form.fields.url = '';
  state.form.errors = {};
  state.form.state = 'filling';
};

const addFeed = (state, feedData) => {
  const newFeed = {
    id: `feed-${Date.now()}`,
    url: feedData.url,
    title: feedData.feed.title,
    description: feedData.feed.description,
  };
  
  state.feeds.push(newFeed);
};

const addPosts = (state, postsData) => {
  const newPosts = postsData.map(post => ({
    ...post,
    feedId: postsData.feedId,
  }));
  
  state.posts = [...state.posts, ...newPosts];
};

const setNotification = (state, notification) => {
  state.ui.notification = notification;
};

const clearNotification = (state) => {
  state.ui.notification = null;
};

const setLanguage = (state, lng) => {
  state.lng = lng;
};

const setLoading = (state, loading) => {
  state.ui.loading = loading;
};

const setError = (state, error) => {
  state.ui.error = error;
};

const clearError = (state) => {
  state.ui.error = null;
};

export {
  getFormState,
  getFormUrl,
  getFormErrors,
  getFeeds,
  getPosts,
  getNotification,
  getLanguage,
  getLoading,
  getError,
  setFormState,
  setFormUrl,
  setFormErrors,
  clearForm,
  addFeed,
  addPosts,
  setNotification,
  clearNotification,
  setLanguage,
  setLoading,
  setError,
  clearError,
};

export default createState;
