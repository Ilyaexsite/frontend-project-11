import axios from 'axios'

const createProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get')
  proxyUrl.searchParams.set('url', url)
  proxyUrl.searchParams.set('disableCache', 'true')
  return proxyUrl.toString()
}

const fetchRssData = (url) => {
  const targetUrl = process.env.NODE_ENV === 'test' ? url : createProxyUrl(url)
  return axios.get(targetUrl, { timeout: 10000 })
    .then((response) => {
      if (response.data.status && response.data.status.http_code !== 200) {
        throw new Error('networkError')
      }
      return process.env.NODE_ENV === 'test' ? response.data : response.data.contents
    })
    .catch((error) => {
      if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        throw new Error('networkError')
      }
      if (error.response?.status >= 400) {
        throw new Error('rssError')
      }
      throw new Error('unknown')
    })
}

export { fetchRssData }
