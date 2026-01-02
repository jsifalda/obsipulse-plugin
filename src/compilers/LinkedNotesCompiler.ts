import { App, TFile } from "obsidian"
import {
  LINKED_NOTES_REGEX,
  createCacheKey,
  extractBlockContent,
  extractSectionContent,
  findNoteFile,
  isCircularReference,
  parseNoteReference,
  readNoteContent,
  removeFrontmatter,
  removeHtmlComments,
  sanitizeNoteName,
} from "../helpers/linkedNotesHelpers"

type PublishFile = TFile

export type TCompilerStep = (
  publishFile: PublishFile
) =>
  | ((partiallyCompiledContent: string) => Promise<string>)
  | ((partiallyCompiledContent: string) => string)

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
      // Remove HTML comments from main content before processing linked notes
      const contentWithoutComments = removeHtmlComments(text)
      return await this.resolveLinkedNotes(contentWithoutComments, file, 0)
    } catch (error) {
      console.error("LinkedNotesCompiler error:", error)
      return text
    }
  }

  private async resolveLinkedNotes(
    content: string,
    file: PublishFile,
    depth: number
  ): Promise<string> {
    if (depth >= this.maxDepth) {
      return content
    }

    let resolvedContent = content
    const matches: RegExpMatchArray[] = []
    let match: RegExpExecArray | null

    while ((match = LINKED_NOTES_REGEX.exec(content)) !== null) {
      matches.push(match)
    }

    for (const match of matches) {
      const fullMatch = match[0]
      const noteName = sanitizeNoteName(match[1])
      const fragment = match[2] ? match[2].substring(1) : undefined // Remove leading #

      try {
        const resolvedNote = await this.resolveNote(
          noteName,
          file,
          depth,
          fragment
        )
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
    fragment?: string
  ): Promise<string | null> {
    const { section, blockId } = fragment
      ? parseNoteReference(`${noteName}#${fragment}`)
      : { section: undefined, blockId: undefined }

    const cacheKey = createCacheKey(noteName, depth, section, blockId)

    if (this.resolvedNotes.has(cacheKey)) {
      return this.resolvedNotes.get(cacheKey) || null
    }

    const referenceKey = section
      ? `${noteName}#${section}`
      : blockId
      ? `${noteName}#^${blockId}`
      : noteName

    if (isCircularReference(this.processingStack, referenceKey)) {
      console.warn(`Circular reference detected for note: ${referenceKey}`)
      return null
    }

    this.processingStack.add(referenceKey)

    try {
      const noteFile = findNoteFile(this.app, noteName)
      if (!noteFile) {
        console.warn(`Note not found: ${noteName}`)
        return null
      }

      const noteContent = await readNoteContent(this.app, noteFile)
      const contentWithoutFrontmatter = removeFrontmatter(noteContent)
      // Remove HTML comments from linked note content after frontmatter removal
      const contentWithoutComments = removeHtmlComments(
        contentWithoutFrontmatter
      )

      let extractedContent: string | null = contentWithoutComments

      if (section) {
        extractedContent = extractSectionContent(
          contentWithoutComments,
          section
        )
        if (!extractedContent) {
          console.warn(`Section "${section}" not found in note: ${noteName}`)
          return null
        }
      } else if (blockId) {
        extractedContent = extractBlockContent(contentWithoutComments, blockId)
        if (!extractedContent) {
          console.warn(`Block "^${blockId}" not found in note: ${noteName}`)
          return null
        }
      }

      const resolvedContent = await this.resolveLinkedNotes(
        extractedContent,
        noteFile,
        depth + 1
      )

      this.resolvedNotes.set(cacheKey, resolvedContent)
      return resolvedContent
    } finally {
      this.processingStack.delete(referenceKey)
    }
  }

  setMaxDepth(depth: number): void {
    this.maxDepth = depth
  }

  clearCache(): void {
    this.resolvedNotes.clear()
  }
}
