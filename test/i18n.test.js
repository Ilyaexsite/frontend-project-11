import { describe, it, expect, beforeAll } from 'vitest'
import { initI18n, t } from '../src/i18n.js'

describe('i18next Integration', () => {
  beforeAll(async () => {
    await initI18n()
  })

  it('should translate app title', () => {
    expect(t('app.title')).toBe('RSS агрегатор')
  })

  it('should translate form labels', () => {
    expect(t('form.label')).toBe('Ссылка RSS')
    expect(t('form.submit')).toBe('Добавить')
  })

  it('should translate validation errors', () => {
    expect(t('errors.required')).toBe('Не должно быть пустым')
    expect(t('errors.url')).toBe('Ссылка должна быть валидным URL')
  })
})
