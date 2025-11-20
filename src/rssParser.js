const parseRssContent = (xmlContent) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'text/xml')

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
    id: `${Date.now()}-${index}`,
    title: item.querySelector('title')?.textContent || 'Без названия',
    link: item.querySelector('link')?.textContent || '#',
    description: item.querySelector('description')?.textContent || '',
  }))

  return {
    title,
    description,
    posts,
  }
}

export default parseRssContent
