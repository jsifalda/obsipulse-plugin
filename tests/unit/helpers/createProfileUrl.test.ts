import { describe, it, expect } from 'vitest'
import { createProfileUrl } from '@/src/helpers/createProfileUrl'

describe('createProfileUrl', () => {
  describe('basic URL generation', () => {
    it('should generate correct profile URL with userId and ref', () => {
      const result = createProfileUrl('user123', 'dashboard')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/user123?ref=dashboard')
    })

    it('should generate URL with different userId and ref values', () => {
      const result = createProfileUrl('abc-456', 'settings')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/abc-456?ref=settings')
    })
  })

  describe('edge cases', () => {
    it('should handle empty userId', () => {
      const result = createProfileUrl('', 'ref')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/?ref=ref')
    })

    it('should handle empty ref', () => {
      const result = createProfileUrl('user123', '')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/user123?ref=')
    })

    it('should handle both empty values', () => {
      const result = createProfileUrl('', '')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/?ref=')
    })

    it('should handle userId with special characters', () => {
      const result = createProfileUrl('user@123', 'test')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/user@123?ref=test')
    })

    it('should handle ref with special characters', () => {
      const result = createProfileUrl('user123', 'test&value=1')

      expect(result).toBe('https://www.yourpulse.cc/app/profile/user123?ref=test&value=1')
    })

    it('should handle UUID-style userId', () => {
      const result = createProfileUrl('550e8400-e29b-41d4-a716-446655440000', 'vault')

      expect(result).toBe(
        'https://www.yourpulse.cc/app/profile/550e8400-e29b-41d4-a716-446655440000?ref=vault'
      )
    })

    it('should handle very long userId', () => {
      const longId = 'a'.repeat(100)
      const result = createProfileUrl(longId, 'ref')

      expect(result).toBe(`https://www.yourpulse.cc/app/profile/${longId}?ref=ref`)
    })
  })

  describe('URL structure validation', () => {
    it('should always include the base URL', () => {
      const result = createProfileUrl('test', 'ref')

      expect(result).toContain('https://www.yourpulse.cc/app/profile/')
    })

    it('should always include ref query parameter', () => {
      const result = createProfileUrl('test', 'myref')

      expect(result).toContain('?ref=')
    })

    it('should place userId before query string', () => {
      const result = createProfileUrl('myuser', 'myref')

      const urlParts = result.split('?')
      expect(urlParts[0]).toContain('myuser')
      expect(urlParts[1]).toBe('ref=myref')
    })
  })
})
