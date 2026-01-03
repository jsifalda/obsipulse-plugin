import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addYpPublishUrlToFile } from '@/src/helpers/addYpPublishUrl'
import { TFile } from '../../__mocks__/obsidian'

describe('addYpPublishUrlToFile', () => {
  const createMockApp = () => ({
    fileManager: {
      processFrontMatter: vi.fn(),
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful updates', () => {
    it('should call processFrontMatter with correct file', async () => {
      const app = createMockApp()
      const file = new TFile('test.md')
      const url = 'https://www.yourpulse.cc/app/profile/user123/file/test'

      await addYpPublishUrlToFile(file, app as any, url)

      expect(app.fileManager.processFrontMatter).toHaveBeenCalledWith(file, expect.any(Function))
    })

    it('should set yp-publish-url in frontmatter', async () => {
      const app = createMockApp()
      const file = new TFile('test.md')
      const url = 'https://www.yourpulse.cc/app/profile/user123/file/test'

      // Capture the callback passed to processFrontMatter
      app.fileManager.processFrontMatter.mockImplementation(
        (_file: any, callback: (frontmatter: any) => void) => {
          const frontmatter: Record<string, string> = {}
          callback(frontmatter)
          expect(frontmatter['yp-publish-url']).toBe(url)
        }
      )

      await addYpPublishUrlToFile(file, app as any, url)

      expect(app.fileManager.processFrontMatter).toHaveBeenCalled()
    })

    it('should overwrite existing yp-publish-url', async () => {
      const app = createMockApp()
      const file = new TFile('test.md')
      const newUrl = 'https://www.yourpulse.cc/app/profile/user456/file/new'

      app.fileManager.processFrontMatter.mockImplementation(
        (_file: any, callback: (frontmatter: any) => void) => {
          const frontmatter: Record<string, string> = {
            'yp-publish-url': 'https://old-url.com',
          }
          callback(frontmatter)
          expect(frontmatter['yp-publish-url']).toBe(newUrl)
        }
      )

      await addYpPublishUrlToFile(file, app as any, newUrl)

      expect(app.fileManager.processFrontMatter).toHaveBeenCalled()
    })

    it('should preserve other frontmatter properties', async () => {
      const app = createMockApp()
      const file = new TFile('test.md')
      const url = 'https://www.yourpulse.cc/app/profile/user123/file/test'

      app.fileManager.processFrontMatter.mockImplementation(
        (_file: any, callback: (frontmatter: any) => void) => {
          const frontmatter: Record<string, any> = {
            title: 'My Note',
            tags: ['test', 'publish'],
          }
          callback(frontmatter)
          expect(frontmatter.title).toBe('My Note')
          expect(frontmatter.tags).toEqual(['test', 'publish'])
          expect(frontmatter['yp-publish-url']).toBe(url)
        }
      )

      await addYpPublishUrlToFile(file, app as any, url)
    })
  })

  describe('error handling', () => {
    it('should catch and log error when processFrontMatter throws', async () => {
      const app = createMockApp()
      const file = new TFile('test.md')
      const url = 'https://www.yourpulse.cc/app/profile/user123/file/test'
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      app.fileManager.processFrontMatter.mockImplementation(() => {
        throw new Error('Failed to process frontmatter')
      })

      // Should not throw - error is caught internally
      await expect(addYpPublishUrlToFile(file, app as any, url)).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[yourpulse] error adding yp-publish-url to file:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle missing fileManager gracefully', async () => {
      const app = { fileManager: { processFrontMatter: vi.fn() } }
      app.fileManager.processFrontMatter.mockImplementation(() => {
        throw new TypeError("Cannot read property 'processFrontMatter' of undefined")
      })
      const file = new TFile('test.md')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        addYpPublishUrlToFile(file, app as any, 'https://example.com')
      ).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
