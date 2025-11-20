const parseRssContent = (xmlString) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
  if (parseError) {
    throw new Error('Invalid RSS format')
  }

  const channel = xmlDoc.querySelector('channel')
  if (!channel) {
    throw new Error('No channel found in RSS')
  }

  const title = channel.querySelector('title')?.textContent || 'No title'
  const description = channel.querySelector('description')?.textContent || 'No description'
  
  const items = xmlDoc.querySelectorAll('item')
  const posts = Array.from(items).map((item, index) => {
    const itemTitle = item.querySelector('title')?.textContent || `Post ${index + 1}`
    
    // Более надежное извлечение описания
    let itemDescription = item.querySelector('description')?.textContent || ''
    // Убираем HTML теги если они есть
    itemDescription = itemDescription.replace(/<[^>]*>/g, '').trim()
    
    const itemLink = item.querySelector('link')?.textContent || '#'
    const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString()
    
    return {
      id: `post-${Date.now()}-${index}`,
      title: itemTitle,
      description: itemDescription,
      link: itemLink,
      pubDate: pubDate,
    }
  })

  return {
    title,
    description,
    posts,
  }
}

export default parseRssContent
