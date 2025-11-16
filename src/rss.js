import axios from 'axios'
import { isTestEnv } from './config.js'

const createProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get')
  proxyUrl.searchParams.set('url', url)
  proxyUrl.searchParams.set('disableCache', 'true')
  return proxyUrl.toString()
}

const fetchRssData = async (url) => {
  try {
    // В тестовом окружении используем прямой URL
    const targetUrl = isTestEnv ? url : createProxyUrl(url)
    
    const response = await axios.get(targetUrl, { timeout: 10000 })
    
    if (isTestEnv) {
      return response.data
    }
    
    if (response.data.status && response.data.status.http_code !== 200) {
      throw new Error('networkError')
    }
    return response.data.contents
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
      throw new Error('networkError')
    }
    if (error.response?.status >= 400) {
      throw new Error('rssError')
    }
    throw new Error('unknown')
  }
}

const parseRssData = (xmlString) => {
  try {
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
  } catch (error) {
    throw new Error('rssError')
  }
}

const loadRssFeed = async (url) => {
  try {
    const xmlData = await fetchRssData(url)
    const parsedData = parseRssData(xmlData)
    return {
      ...parsedData,
      url,
    }
  } catch (error) {
    throw error
  }
}

const checkFeedUpdates = async (url, existingPosts) => {
  try {
    const newData = await loadRssFeed(url)
    const existingPostIds = new Set(existingPosts.map(post => post.id))
    const newPosts = newData.posts.filter(post => !existingPostIds.has(post.id))
    
    return {
      newPosts: newPosts.map(post => ({
        ...post,
        feedId: url,
      })),
      feedUrl: url,
    }
  } catch (error) {
    console.error(`Error checking updates for ${url}:`, error)
    return {
      newPosts: [],
      feedUrl: url,
      error: error.message,
    }
  }
}

export { loadRssFeed, parseRssData, checkFeedUpdates }
