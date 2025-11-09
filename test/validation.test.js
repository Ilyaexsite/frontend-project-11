import { describe, it, expect } from 'vitest';
import validateRssUrl from '../src/validation.js';

describe('RSS URL Validation', () => {
  it('should validate correct URLs', async () => {
    const result = await validateRssUrl('https://example.com/rss');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty URLs', async () => {
    const result = await validateRssUrl('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('URL не может быть пустым');
  });

  it('should reject invalid URLs', async () => {
    const result = await validateRssUrl('invalid-url');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ссылка должна быть валидным URL');
  });

  it('should reject duplicate URLs', async () => {
    const existingUrls = ['https://example.com/rss', 'https://test.com/feed'];
    const result = await validateRssUrl('https://example.com/rss', existingUrls);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RSS уже существует');
  });

  it('should accept unique URLs', async () => {
    const existingUrls = ['https://example.com/rss'];
    const result = await validateRssUrl('https://new-example.com/feed', existingUrls);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
