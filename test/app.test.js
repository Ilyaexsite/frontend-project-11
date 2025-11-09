import { describe, it, expect, beforeEach, afterEach } from 'vitest';

class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }
}

global.localStorage = new LocalStorageMock()

global.bootstrap = {
  Alert: class {
    constructor() {
      this.close = () => {}
    }
  }
}

describe('RSS Aggregator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="rss-form">
        <input type="url" id="rss-url" name="rss-url">
        <button type="submit">Submit</button>
      </form>
      <div id="feeds-container"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should validate URLs correctly', () => {
    const validateUrl = (url) => {
      try {
        new URL(url);
        return url.startsWith('http');
      } catch {
        return false
      }
    }

    expect(validateUrl('https://example.com/rss')).toBe(true)
    expect(validateUrl('http://example.com/rss')).toBe(true)
    expect(validateUrl('invalid-url')).toBe(false)
    expect(validateUrl('')).toBe(false)
  })

  it('should generate mock feed items', () => {
    const generateMockFeedItems = () => {
      const items = [];
      const titles = [
        'Новость о запуске проекта',
        'Обновление функционала',
        'Техническое обслуживание',
        'Новые возможности платформы',
        'Интервью с разработчиком'
      ];
      
      for (let i = 0; i < 3; i += 1) {
        items.push({
          title: titles[Math.floor(Math.random() * titles.length)],
          link: '#',
          pubDate: new Date().toLocaleDateString('ru-RU'),
          description: `Описание новости ${i + 1}`
        });
      }
      
      return items
    }

    const items = generateMockFeedItems()
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveProperty('title')
    expect(items[0]).toHaveProperty('link')
    expect(items[0]).toHaveProperty('description')
  })
})
