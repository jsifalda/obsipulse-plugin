import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getLocalTodayDate } from '@/src/helpers/getLocalTodayDate'

describe('getLocalTodayDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return date in YYYY-MM-DD format', () => {
    vi.setSystemTime(new Date('2024-06-15T10:00:00'))

    const result = getLocalTodayDate()

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should return correct date for specific time', () => {
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

    const result = getLocalTodayDate()

    expect(result).toMatch(/^2024-01-\d{2}$/)
  })

  it('should handle midnight edge cases', () => {
    vi.setSystemTime(new Date('2024-03-01T00:00:01'))

    const result = getLocalTodayDate()

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should handle end of year', () => {
    vi.setSystemTime(new Date('2024-12-31T23:59:59'))

    const result = getLocalTodayDate()

    expect(result).toMatch(/^2024-12-31$/)
  })

  it('should handle leap year date', () => {
    vi.setSystemTime(new Date('2024-02-29T12:00:00'))

    const result = getLocalTodayDate()

    expect(result).toBe('2024-02-29')
  })
})
