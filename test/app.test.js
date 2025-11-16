import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('URL Validation', () => {
  it('should validate correct URLs', () => {
    const validateUrl = (url) => {
      try {
        new URL(url)
        return url.startsWith('http')
      } catch {
        return false
      }
    }

    expect(validateUrl('https://example.com/rss')).toBe(true)
    expect(validateUrl('http://example.com/rss')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    const validateUrl = (url) => {
      try {
        new URL(url)
        return url.startsWith('http')
      } catch {
        return false
      }
    }

    expect(validateUrl('invalid-url')).toBe(false)
    expect(validateUrl('')).toBe(false)
  })
})
