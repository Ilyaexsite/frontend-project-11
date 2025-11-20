import parseRssContent from './rssParser.js'

const loadRssFeed = async (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url='
  const fullUrl = proxyUrl + encodeURIComponent(url)

  const response = await fetch(fullUrl)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  if (!data.contents) {
    throw new Error('No content received from RSS feed')
  }

  const parsedData = parseRssContent(data.contents)

  return {
    url,
    ...parsedData,
  }
}

export { loadRssFeed }
