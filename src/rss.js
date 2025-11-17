const loadRssFeed = async (url) => {
  console.log('🌐 Loading RSS from:', url)

  try {
    const proxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url='
    const fullUrl = proxyUrl + encodeURIComponent(url)

    console.log('🔗 Fetching from proxy:', fullUrl)

    const response = await fetch(fullUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📦 RSS data received, contents length:', data.contents?.length)

    if (!data.contents) {
      throw new Error('No content received from RSS feed')
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(data.contents, 'text/xml')

    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      console.error('❌ RSS parsing error:', parseError.textContent)
      throw new Error('rssError')
    }

    const title = doc.querySelector('channel > title')?.textContent || 
      doc.querySelector('title')?.textContent || 
              'Без названия'
    const description = doc.querySelector('channel > description')?.textContent || 
              doc.querySelector('description')?.textContent || 
                'Без описания'

    const items = doc.querySelectorAll('item')
    console.log('📰 Found items:', items.length)

    const posts = Array.from(items).map((item, index) => ({
      id: `${url}-${index}-${Date.now()}`,
      title: item.querySelector('title')?.textContent || 'Без названия',
      link: item.querySelector('link')?.textContent || '#',
      description: item.querySelector('description')?.textContent || '',
    }))

    console.log('✅ Parsed feed successfully:', { 
      title, 
      description, 
      postsCount: posts.length 
    })

    return {
      url,
      title, 
      description, 
      posts,
    }

  } catch (error) {
    console.error('💥 RSS loading error:', error)
    console.error('Error details:', error.message)
    throw error
  }
}

export { loadRssFeed }
