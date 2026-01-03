import { describe, it, expect } from 'vitest'
import {
  parseDailyCounts,
  calculateStreak,
  calculateInLastXDays,
  calculateDailyAverage,
} from '@/lib/stats'
import { DailyCountItem } from '@/lib/types'

describe('lib/stats', () => {
  describe('parseDailyCounts', () => {
    it('should parse valid date entries', () => {
      const input = {
        '2024-01-15': 500,
        '2024-01-16': 300,
      }

      const result = parseDailyCounts(input)

      expect(Object.keys(result)).toHaveLength(2)
      expect((result as unknown as Record<string, { value: number }>)['2024-01-15'].value).toBe(500)
    })

    it('should filter out invalid dates', () => {
      const input = {
        '2024-01-15': 500,
        'invalid-date': 100,
        '': 50,
      }

      const result = parseDailyCounts(input)

      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should filter out zero values', () => {
      const input = {
        '2024-01-15': 500,
        '2024-01-16': 0,
      }

      const result = parseDailyCounts(input)

      expect(Object.keys(result)).toHaveLength(1)
    })
  })

  describe('calculateStreak', () => {
    it('should return 0 for empty array', () => {
      expect(calculateStreak([])).toBe(0)
    })

    it('should calculate consecutive day streak', () => {
      const dailyCounts: DailyCountItem[] = [
        { key: '2024-01-15', value: 100, date: new Date('2024-01-15') },
        { key: '2024-01-16', value: 200, date: new Date('2024-01-16') },
        { key: '2024-01-17', value: 150, date: new Date('2024-01-17') },
      ]

      expect(calculateStreak(dailyCounts)).toBe(3)
    })

    it('should reset streak on gap days', () => {
      const dailyCounts: DailyCountItem[] = [
        { key: '2024-01-15', value: 100, date: new Date('2024-01-15') },
        { key: '2024-01-17', value: 200, date: new Date('2024-01-17') },
      ]

      expect(calculateStreak(dailyCounts)).toBe(1)
    })

    it('should reset streak when value is 0', () => {
      const dailyCounts: DailyCountItem[] = [
        { key: '2024-01-15', value: 100, date: new Date('2024-01-15') },
        { key: '2024-01-16', value: 0, date: new Date('2024-01-16') },
        { key: '2024-01-17', value: 200, date: new Date('2024-01-17') },
      ]

      expect(calculateStreak(dailyCounts)).toBe(1)
    })
  })

  describe('calculateInLastXDays', () => {
    it('should sum values within the date range', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      const dailyCounts: DailyCountItem[] = [
        { key: 'today', value: 100, date: today },
        { key: 'yesterday', value: 200, date: yesterday },
      ]

      expect(calculateInLastXDays(dailyCounts, 7)).toBe(300)
    })

    it('should exclude values outside the date range', () => {
      const today = new Date()
      const oldDate = new Date(today)
      oldDate.setDate(today.getDate() - 30)

      const dailyCounts: DailyCountItem[] = [
        { key: 'today', value: 100, date: today },
        { key: 'old', value: 500, date: oldDate },
      ]

      expect(calculateInLastXDays(dailyCounts, 7)).toBe(100)
    })
  })

  describe('calculateDailyAverage', () => {
    it('should return 0 for empty array', () => {
      expect(calculateDailyAverage([])).toBe(0)
    })

    it('should calculate correct average', () => {
      const dailyCounts: DailyCountItem[] = [
        { key: '1', value: 100, date: new Date() },
        { key: '2', value: 200, date: new Date() },
        { key: '3', value: 300, date: new Date() },
      ]

      expect(calculateDailyAverage(dailyCounts)).toBe(200)
    })

    it('should round the average', () => {
      const dailyCounts: DailyCountItem[] = [
        { key: '1', value: 100, date: new Date() },
        { key: '2', value: 101, date: new Date() },
      ]

      expect(calculateDailyAverage(dailyCounts)).toBe(101)
    })
  })
})
