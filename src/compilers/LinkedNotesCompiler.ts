import { App, TFile } from 'obsidian'
import {
  LINKED_NOTES_REGEX,
  createCacheKey,
  findNoteFile,
  isCircularReference,
  readNoteContent,
  sanitizeNoteName,
} from '../helpers/linkedNotesHelpers'

type PublishFile = TFile

export type TCompilerStep = (
  publishFile: PublishFile,
) => ((partiallyCompiledContent: string) => Promise<string>) | ((partiallyCompiledContent: string) => string)

export class LinkedNotesCompiler {
  private app: App
  private maxDepth: number
  private resolvedNotes: Map<string, string> = new Map()
  private processingStack: Set<string> = new Set()

  constructor(app: App, maxDepth: number = 3) {
    this.app = app
    this.maxDepth = maxDepth
  }

  compile: TCompilerStep = (file) => async (text) => {
    try {
      return await this.resolveLinkedNotes(text, file, 0)
    } catch (error) {
      console.error('LinkedNotesCompiler error:', error)
      return text
    }
  }

  private async resolveLinkedNotes(content: string, file: PublishFile, depth: number): Promise<string> {
    if (depth >= this.maxDepth) {
      return content
    }

    let resolvedContent = content
    const matches = content.matchAll(LINKED_NOTES_REGEX)

    for (const match of matches) {
      const fullMatch = match[0]
      const noteName = sanitizeNoteName(match[1])

      try {
        const resolvedNote = await this.resolveNote(noteName, file, depth)
        if (resolvedNote) {
          resolvedContent = resolvedContent.replace(fullMatch, resolvedNote)
        }
      } catch (error) {
        console.error(`Error resolving note "${noteName}":`, error)
      }
    }

    return resolvedContent
  }

  private async resolveNote(
    noteName: string,
    currentFile: PublishFile,
    depth: number,
  ): Promise<string | null> {
    const cacheKey = createCacheKey(noteName, depth)

    if (this.resolvedNotes.has(cacheKey)) {
      return this.resolvedNotes.get(cacheKey) || null
    }

    if (isCircularReference(this.processingStack, noteName)) {
      console.warn(`Circular reference detected for note: ${noteName}`)
      return null
    }

    this.processingStack.add(noteName)

    try {
      const noteFile = findNoteFile(this.app, noteName)
      if (!noteFile) {
        console.warn(`Note not found: ${noteName}`)
        return null
      }

      const noteContent = await readNoteContent(this.app, noteFile)
      const resolvedContent = await this.resolveLinkedNotes(noteContent, noteFile, depth + 1)

      this.resolvedNotes.set(cacheKey, resolvedContent)
      return resolvedContent
    } finally {
      this.processingStack.delete(noteName)
    }
  }

  setMaxDepth(depth: number): void {
    this.maxDepth = depth
  }

  clearCache(): void {
    this.resolvedNotes.clear()
  }
}
