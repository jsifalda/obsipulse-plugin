import { App, TFile } from 'obsidian'

export const LINKED_NOTES_REGEX = /!\[\[([^\]]+)\]\]/g

export function extractNoteNames(content: string): string[] {
  const matches = content.matchAll(LINKED_NOTES_REGEX)
  const noteNames: string[] = []

  for (const match of matches) {
    noteNames.push(match[1])
  }

  return [...new Set(noteNames)]
}

export function findNoteFile(app: App, noteName: string): TFile | null {
  const files = app.vault.getMarkdownFiles()

  for (const file of files) {
    if (file.basename === noteName || file.name === noteName) {
      return file
    }
  }

  return null
}

export async function readNoteContent(app: App, noteFile: TFile): Promise<string> {
  try {
    return await app.vault.read(noteFile)
  } catch (error) {
    console.error(`Error reading note content: ${noteFile.path}`, error)
    throw error
  }
}

export function removeFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/
  return content.replace(frontmatterRegex, '')
}

export function isCircularReference(processingStack: Set<string>, noteName: string): boolean {
  return processingStack.has(noteName)
}

export function isContentTooLarge(content: string, maxSize: number): boolean {
  return content.length > maxSize
}

export function sanitizeNoteName(noteName: string): string {
  return noteName.trim()
}

export function createCacheKey(noteName: string, depth: number): string {
  return `${noteName}-${depth}`
}
