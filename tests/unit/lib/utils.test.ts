import { describe, it, expect } from 'vitest'
import { cn, convertObjectToArray, isValidDate, parseDateString } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
    })

    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    })
  })

  describe('convertObjectToArray', () => {
    it('should convert object values to array', () => {
      const input = { a: 1, b: 2, c: 3 }
      expect(convertObjectToArray(input)).toEqual([1, 2, 3])
    })

    it('should return empty array for empty object', () => {
      expect(convertObjectToArray({})).toEqual([])
    })

    it('should handle objects with mixed value types', () => {
      const input = { a: 'string', b: 42, c: true }
      expect(convertObjectToArray(input)).toEqual(['string', 42, true])
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date('2024-01-15'))).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
    })

    it('should return false for non-date values', () => {
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
      expect(isValidDate('2024-01-15')).toBe(false)
      expect(isValidDate(123456789)).toBe(false)
    })
  })

  describe('parseDateString', () => {
    it('should parse YYYY-MM-DD format', () => {
      const result = parseDateString('2024-01-15')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January = 0
      expect(result.getDate()).toBe(15)
    })

    it('should parse different months correctly', () => {
      const result = parseDateString('2024-12-25')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11) // December = 11
      expect(result.getDate()).toBe(25)
    })

    it('should handle first day of year', () => {
      const result = parseDateString('2024-01-01')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })
  })
})
