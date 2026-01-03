import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiInterceptor } from '@/src/utils/apiInterceptor'

describe('ApiInterceptor', () => {
  let interceptor: ApiInterceptor
  let mockPlugin: any

  beforeEach(() => {
    mockPlugin = {
      settings: {
        privateMode: false,
      },
    }
    interceptor = new ApiInterceptor({ plugin: mockPlugin })
  })

  describe('isPrivateModeActive', () => {
    it('should return false when private mode is disabled', () => {
      mockPlugin.settings.privateMode = false
      expect(interceptor.isPrivateModeActive()).toBe(false)
    })

    it('should return true when private mode is enabled', () => {
      mockPlugin.settings.privateMode = true
      expect(interceptor.isPrivateModeActive()).toBe(true)
    })
  })

  describe('shouldBlockApiRequest', () => {
    it('should not block when private mode is off', () => {
      mockPlugin.settings.privateMode = false
      expect(interceptor.shouldBlockApiRequest()).toBe(false)
    })

    it('should block when private mode is on', () => {
      mockPlugin.settings.privateMode = true
      expect(interceptor.shouldBlockApiRequest()).toBe(true)
    })
  })

  describe('executeIfAllowed', () => {
    it('should execute request when private mode is off', async () => {
      mockPlugin.settings.privateMode = false
      const mockFn = vi.fn().mockResolvedValue('success')

      const result = await interceptor.executeIfAllowed(mockFn)

      expect(mockFn).toHaveBeenCalled()
      expect(result).toBe('success')
    })

    it('should block request and return null when private mode is on', async () => {
      mockPlugin.settings.privateMode = true
      const mockFn = vi.fn().mockResolvedValue('success')

      const result = await interceptor.executeIfAllowed(mockFn)

      expect(mockFn).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('should propagate errors from request function', async () => {
      mockPlugin.settings.privateMode = false
      const error = new Error('Network error')
      const mockFn = vi.fn().mockRejectedValue(error)

      await expect(interceptor.executeIfAllowed(mockFn)).rejects.toThrow('Network error')
    })
  })

  describe('logBlockedRequest', () => {
    it('should log when private mode is active', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      mockPlugin.settings.privateMode = true

      interceptor.logBlockedRequest()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('API request blocked'))
    })

    it('should not log when private mode is inactive', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      mockPlugin.settings.privateMode = false

      interceptor.logBlockedRequest()

      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })
})
