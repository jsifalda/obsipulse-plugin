import { describe, it, expect, vi } from 'vitest'
import { hasYpPublishFileProperty } from '@/src/helpers/isYpPublish'
import { TFile, createMockApp } from '../../__mocks__/obsidian'

describe('hasYpPublishFileProperty', () => {
  const createTestFile = (path: string) => new TFile(path)

  describe('when yp-publish is true', () => {
    it('should return true for basic yp-publish: true', async () => {
      const content = `---
yp-publish: true
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(true)
    })

    it('should return true with extra whitespace around colon', async () => {
      const content = `---
yp-publish  :   true
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(true)
    })

    it('should return true with leading whitespace', async () => {
      const content = `---
  yp-publish: true
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(true)
    })

    it('should return true with trailing whitespace', async () => {
      const content = `---
yp-publish: true   
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(true)
    })

    it('should return true when yp-publish is among other frontmatter properties', async () => {
      const content = `---
title: My Note
yp-publish: true
tags: [test, publish]
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(true)
    })
  })

  describe('when yp-publish is false or missing', () => {
    it('should return false for yp-publish: false', async () => {
      const content = `---
yp-publish: false
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })

    it('should return false when yp-publish is not present', async () => {
      const content = `---
title: My Note
tags: [test]
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })

    it('should return false for empty frontmatter', async () => {
      const content = `---
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })
  })

  describe('when frontmatter is missing or invalid', () => {
    it('should return false when no frontmatter exists', async () => {
      const content = `# Content without frontmatter`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })

    it('should return false for empty file', async () => {
      const files = new Map([['/test.md', '']])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })

    it('should return false for malformed frontmatter (missing closing)', async () => {
      const content = `---
yp-publish: true
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should return false when vault.read throws an error', async () => {
      const app = createMockApp()
      app.vault.read = vi.fn().mockRejectedValue(new Error('File not found'))
      const file = createTestFile('/nonexistent.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })
  })

  describe('edge cases with similar property names', () => {
    it('should not match yp-publish-url property', async () => {
      const content = `---
yp-publish-url: https://example.com
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })

    it('should not match yp-publish with string value "true"', async () => {
      const content = `---
yp-publish: "true"
---
# Content`
      const files = new Map([['/test.md', content]])
      const app = createMockApp(files)
      const file = createTestFile('/test.md')

      const result = await hasYpPublishFileProperty(file, app as any)

      expect(result).toBe(false)
    })
  })
})
