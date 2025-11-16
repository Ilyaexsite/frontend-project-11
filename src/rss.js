import { fetchRssData } from './api.js'

const parseRssData = (xmlString) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')
  
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('rssError')
  }
  
  const channel = doc.querySelector('channel')
  if (!channel) {
    throw new Error('rssError')
  }
  
  const feedTitle = channel.querySelector('title')?.textContent || 'Без названия'
  const feedDescription = channel.querySelector('description')?.textContent || 'Без описания'
  
  const items = doc.querySelectorAll('item')
  const posts = Array.from(items).map((item, index) => {
    const title = item.querySelector('title')?.textContent || `Пост ${index + 1}`
    const link = item.querySelector('link')?.textContent || '#'
    const description = item.querySelector('description')?.textContent || ''
    
    return {
      id: `${link}-${title}`.replace(/[^a-zA-Z0-9]/g, '-'),
      title,
      link,
      description,
    }
  })
  
  return {
    feed: {
      title: feedTitle,
      description: feedDescription,
    },
    posts,
  }
}

const loadRssFeed = (url) => {
  return fetchRssData(url)
    .then((xmlData) => parseRssData(xmlData))
    .then((parsedData) => ({
      ...parsedData,
      url,
    }))
}

const checkFeedUpdates = (url, existingPosts) => {
  return loadRssFeed(url)
    .then((newData) => {
      const existingPostIds = new Set(existingPosts.map(post => post.id))
      const newPosts = newData.posts.filter(post => !existingPostIds.has(post.id))
      
      return {
        newPosts: newPosts.map(post => ({
          ...post,
          feedId: url,
        })),
        feedUrl: url,
      }
    })
    .catch((error) => {
      console.error(`Error checking updates for ${url}:`, error)
      return {
        newPosts: [],
        feedUrl: url,
        error: error.message,
      }
    })
}

export { loadRssFeed, parseRssData, checkFeedUpdates }
