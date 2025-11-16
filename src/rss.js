import axios from 'axios';

// Прокси для обхода CORS
const createProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('url', url);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

// Скачивание RSS данных
const fetchRssData = (url) => {
  const proxyUrl = createProxyUrl(url);
  
  return axios.get(proxyUrl, { timeout: 10000 })
    .then((response) => {
      if (response.data.status.http_code !== 200) {
        throw new Error('networkError');
      }
      return response.data.contents;
    })
    .catch((error) => {
      if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        throw new Error('networkError');
      }
      if (error.response?.status >= 400) {
        throw new Error('rssError');
      }
      throw new Error('unknown');
    });
};

// Парсинг RSS данных
const parseRssData = (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('rssError');
  }
  
  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('rssError');
  }
  
  const feedTitle = channel.querySelector('title')?.textContent || 'Без названия';
  const feedDescription = channel.querySelector('description')?.textContent || 'Без описания';
  
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((item, index) => {
    const title = item.querySelector('title')?.textContent || `Пост ${index + 1}`;
    const link = item.querySelector('link')?.textContent || '#';
    const description = item.querySelector('description')?.textContent || '';
    
    return {
      id: `post-${Date.now()}-${index}`,
      title,
      link,
      description,
    };
  });
  
  return {
    feed: {
      title: feedTitle,
      description: feedDescription,
    },
    posts,
  };
};

// Основная функция для получения и парсинга RSS
const loadRssFeed = (url) => {
  return fetchRssData(url)
    .then((xmlData) => parseRssData(xmlData))
    .then((parsedData) => ({
      ...parsedData,
      url,
    }));
};

export { loadRssFeed, parseRssData, fetchRssData };
