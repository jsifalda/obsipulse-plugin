import { describe, it, expect, vi } from 'vitest'
import {
  parseNoteReference,
  extractNoteNames,
  removeFrontmatter,
  removeHtmlComments,
  extractSectionContent,
  extractBlockContent,
  isCircularReference,
  createCacheKey,
  sanitizeNoteName,
  findNoteFile,
  readNoteContent,
  isContentTooLarge,
} from '@/src/helpers/linkedNotesHelpers'
import { TFile, createMockApp } from '../../__mocks__/obsidian'

describe('linkedNotesHelpers', () => {
  describe('parseNoteReference', () => {
    it('should parse simple note reference', () => {
      const result = parseNoteReference('my-note')
      expect(result).toEqual({ noteName: 'my-note' })
    })

    it('should parse note reference with section', () => {
      const result = parseNoteReference('my-note#heading')
      expect(result).toEqual({ noteName: 'my-note', section: 'heading' })
    })

    it('should parse note reference with block id', () => {
      const result = parseNoteReference('my-note#^block123')
      expect(result).toEqual({ noteName: 'my-note', blockId: 'block123' })
    })

    it('should handle whitespace in note names', () => {
      const result = parseNoteReference('  my note  ')
      expect(result.noteName).toBe('my note')
    })
  })

  describe('extractNoteNames', () => {
    it('should extract note names from content', () => {
      const content = 'Some text ![[note1]] and ![[note2#section]]'
      expect(extractNoteNames(content)).toEqual(['note1', 'note2'])
    })

    it('should return unique names', () => {
      const content = '![[note]] and ![[note]] again'
      expect(extractNoteNames(content)).toEqual(['note'])
    })

    it('should return empty array for no matches', () => {
      expect(extractNoteNames('no links here')).toEqual([])
    })

    it('should handle block references', () => {
      const content = '![[note#^block123]]'
      expect(extractNoteNames(content)).toEqual(['note'])
    })
  })

  describe('removeFrontmatter', () => {
    it('should remove YAML frontmatter', () => {
      const content = `---
title: Test
date: 2024-01-15
---
# Content here`

      expect(removeFrontmatter(content).trim()).toBe('# Content here')
    })

    it('should return content unchanged if no frontmatter', () => {
      const content = '# Just content'
      expect(removeFrontmatter(content)).toBe(content)
    })

    it('should handle frontmatter with content', () => {
      const content = `---
key: value
---
Content`
      expect(removeFrontmatter(content).trim()).toBe('Content')
    })
  })

  describe('removeHtmlComments', () => {
    it('should remove single-line comments', () => {
      const content = 'Before <!-- comment --> After'
      expect(removeHtmlComments(content)).toBe('Before  After')
    })

    it('should remove multi-line comments', () => {
      const content = `Before
<!-- multi
line
comment -->
After`
      expect(removeHtmlComments(content)).toBe(`Before

After`)
    })

    it('should handle multiple comments', () => {
      const content = '<!-- first --> middle <!-- second -->'
      expect(removeHtmlComments(content)).toBe(' middle ')
    })
  })

  describe('extractSectionContent', () => {
    it('should extract content under a heading', () => {
      const content = `# Heading 1
Content 1

## Heading 2
Content 2

## Heading 3
Content 3`

      const result = extractSectionContent(content, 'Heading 2')
      expect(result).toContain('## Heading 2')
      expect(result).toContain('Content 2')
      expect(result).not.toContain('Content 3')
    })

    it('should return null if section not found', () => {
      expect(extractSectionContent('# Other', 'Missing')).toBeNull()
    })

    it('should be case-insensitive', () => {
      const content = '## My Section\nContent'
      expect(extractSectionContent(content, 'my section')).not.toBeNull()
    })
  })

  describe('extractBlockContent', () => {
    it('should extract block by id', () => {
      const content = `Some paragraph with block id ^block123

Another paragraph`

      const result = extractBlockContent(content, 'block123')
      expect(result).toContain('Some paragraph with block id')
    })

    it('should return null if block not found', () => {
      expect(extractBlockContent('no blocks', 'missing')).toBeNull()
    })
  })

  describe('isCircularReference', () => {
    it('should detect circular reference', () => {
      const stack = new Set(['note1', 'note2'])
      expect(isCircularReference(stack, 'note1')).toBe(true)
    })

    it('should return false for new reference', () => {
      const stack = new Set(['note1'])
      expect(isCircularReference(stack, 'note2')).toBe(false)
    })
  })

  describe('createCacheKey', () => {
    it('should create key for simple note', () => {
      expect(createCacheKey('note', 0)).toBe('note-0')
    })

    it('should include section in key', () => {
      expect(createCacheKey('note', 1, 'section')).toBe('note#section-1')
    })

    it('should include block id in key', () => {
      expect(createCacheKey('note', 2, undefined, 'block')).toBe('note#^block-2')
    })
  })

  describe('sanitizeNoteName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeNoteName('  note  ')).toBe('note')
    })
  })

  describe('findNoteFile', () => {
    it('should find file by basename', () => {
      const files = new Map([
        ['folder/my-note.md', 'content'],
        ['another/note.md', 'other content'],
      ])
      const app = createMockApp(files)

      const result = findNoteFile(app as any, 'my-note')

      expect(result).not.toBeNull()
      expect(result?.basename).toBe('my-note')
    })

    it('should find file by full name with extension', () => {
      const files = new Map([['folder/my-note.md', 'content']])
      const app = createMockApp(files)

      const result = findNoteFile(app as any, 'my-note.md')

      expect(result).not.toBeNull()
    })

    it('should return null when file not found', () => {
      const files = new Map([['folder/existing.md', 'content']])
      const app = createMockApp(files)

      const result = findNoteFile(app as any, 'nonexistent')

      expect(result).toBeNull()
    })

    it('should return null for empty vault', () => {
      const app = createMockApp(new Map())

      const result = findNoteFile(app as any, 'any-note')

      expect(result).toBeNull()
    })
  })

  describe('readNoteContent', () => {
    it('should read note content successfully', async () => {
      const files = new Map([['test.md', 'Hello World']])
      const app = createMockApp(files)
      const file = new TFile('test.md')

      const result = await readNoteContent(app as any, file)

      expect(result).toBe('Hello World')
    })

    it('should throw error when read fails', async () => {
      const app = createMockApp()
      app.vault.read = vi.fn().mockRejectedValue(new Error('Read failed'))
      const file = new TFile('missing.md')

      await expect(readNoteContent(app as any, file)).rejects.toThrow('Read failed')
    })
  })

  describe('isContentTooLarge', () => {
    it('should return true when content exceeds max size', () => {
      const content = 'a'.repeat(1001)
      expect(isContentTooLarge(content, 1000)).toBe(true)
    })

    it('should return false when content is within max size', () => {
      const content = 'a'.repeat(1000)
      expect(isContentTooLarge(content, 1000)).toBe(false)
    })

    it('should return false when content is smaller than max size', () => {
      const content = 'hello'
      expect(isContentTooLarge(content, 1000)).toBe(false)
    })

    it('should handle empty content', () => {
      expect(isContentTooLarge('', 100)).toBe(false)
    })
  })

  describe('extractBlockContent edge cases', () => {
    it('should extract list item with block id', () => {
      const content = `- Item one
- Item two ^block123
- Item three`

      const result = extractBlockContent(content, 'block123')
      expect(result).toBe('- Item two')
    })

    it('should extract numbered list item with block id', () => {
      const content = `1. First item
2. Second item ^listblock
3. Third item`

      const result = extractBlockContent(content, 'listblock')
      expect(result).toBe('2. Second item')
    })

    it('should extract multi-line paragraph with block id at end', () => {
      const content = `First paragraph.

This is a longer
paragraph that spans
multiple lines ^para123

Another paragraph.`

      const result = extractBlockContent(content, 'para123')
      expect(result).toContain('This is a longer')
      expect(result).toContain('paragraph that spans')
      expect(result).toContain('multiple lines')
    })

    it('should handle block id at start of file', () => {
      const content = `First line ^startblock

Second paragraph`

      const result = extractBlockContent(content, 'startblock')
      expect(result).toBe('First line')
    })
  })
})
