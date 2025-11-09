import './styles/main.css'

// Основной объект приложения
const app = {
  init() {
    this.feeds = []
    this.bindEvents()
  },

  bindEvents() {
    const rssForm = document.getElementById('rss-form')
    rssForm.addEventListener('submit', this.handleFormSubmit.bind(this))
  },

  handleFormSubmit(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const rssUrl = formData.get('rss-url').trim()
    
    if (this.validateUrl(rssUrl)) {
      this.addRssFeed(rssUrl)
        .then((feedId) => {
          this.showMessage(`RSS поток успешно добавлен: ${rssUrl}`, 'success')
          this.updateFeedsList()
        })
        .catch((error) => {
          this.showMessage(`Ошибка при добавлении RSS: ${error.message}`, 'error')
        })
      
      event.target.reset()
    } else {
      this.showMessage('Пожалуйста, введите корректный URL', 'error')
    }
  },

  validateUrl(url) {
    try {
      new URL(url)
      return url.startsWith('http')
    } catch {
      return false
    }
  },

  addRssFeed(url) {
    return new Promise((resolve, reject) => {
      if (this.feeds.some((feed) => feed.url === url)) {
        reject(new Error('Этот RSS поток уже добавлен'))
        return
      }

      const feedId = `feed-${Date.now()}`;
      const newFeed = {
        id: feedId,
        url,
        title: `RSS Feed - ${new URL(url).hostname}`,
        items: [],
        addedAt: new Date(),
      }

      this.showLoader()
      
      setTimeout(() => {
        this.hideLoader()
        
        newFeed.items = this.generateMockFeedItems()
        this.feeds.push(newFeed)
        
        resolve(feedId)
      }, 2000)
    })
  },

  generateMockFeedItems() {
    const items = []
    const titles = [
      'Новость о запуске проекта',
      'Обновление функционала',
      'Техническое обслуживание',
      'Новые возможности платформы',
      'Интервью с разработчиком'
    ]
    
    for (let i = 0; i < 3; i += 1) {
      items.push({
        title: titles[Math.floor(Math.random() * titles.length)],
        link: '#',
        pubDate: new Date().toLocaleDateString('ru-RU'),
        description: `Описание новости ${i + 1}`
      })
    }
    
    return items
  },

  updateFeedsList() {
    const container = document.getElementById('feeds-container')
    
    if (this.feeds.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-5">
          <h3>Пока нет RSS потоков</h3>
          <p>Добавьте первый RSS поток с помощью формы выше</p>
        </div>
      `
      return
    }

    container.innerHTML = this.feeds.map((feed) => `
      <div class="card mb-4 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3 class="h5 mb-0">${feed.title}</h3>
          <small class="text-muted">${feed.addedAt.toLocaleDateString('ru-RU')}</small>
        </div>
        <div class="card-body">
          <p class="text-muted mb-3"><small>${feed.url}</small></p>
          <div class="list-group">
            ${feed.items.map((item) => `
              <a href="${item.link}" class="list-group-item list-group-item-action" target="_blank">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">${item.title}</h6>
                  <small>${item.pubDate}</small>
                </div>
                <p class="mb-1">${item.description}</p>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('')
  },

  showLoader() {
    const loader = document.getElementById('initial-loader')
    if (loader) {
      loader.style.display = 'block'
    }
  },

  hideLoader() {
    const loader = document.getElementById('initial-loader')
    if (loader) {
      loader.style.display = 'none'
    }
  },

  showMessage(message, type) {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success'
    const alertHtml = `
      <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `
    
    const container = document.getElementById('feeds-container')
    container.insertAdjacentHTML('beforebegin', alertHtml)

    setTimeout(() => {
      const alerts = document.querySelectorAll('.alert')
      alerts.forEach((alert) => {
        const bsAlert = new bootstrap.Alert(alert)
        bsAlert.close();
      })
    }, 5000)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  app.init()
  app.updateFeedsList()
})
