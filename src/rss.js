const loadRssFeed = async (url) => {
  try {
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

    const parser = new DOMParser()
    const doc = parser.parseFromString(data.contents, 'text/xml')

    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error('rssError')
    }

    const title = doc.querySelector('channel > title')?.textContent
      || doc.querySelector('title')?.textContent
      || 'Без названия'
    const description = doc.querySelector('channel > description')?.textContent
      || doc.querySelector('description')?.textContent
      || 'Без описания'

    const items = doc.querySelectorAll('item')

    const posts = Array.from(items).map((item, index) => ({
      id: `${url}-${index}-${Date.now()}`,
      title: item.querySelector('title')?.textContent || 'Без названия',
      link: item.querySelector('link')?.textContent || '#',
      description: item.querySelector('description')?.textContent || '',
    }))

    return {
      url,
      title,
      description,
      posts,
    }
  }
  catch (error) {
    throw error
  }
}

export { loadRssFeed }
