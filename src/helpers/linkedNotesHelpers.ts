import { App, TFile } from "obsidian"

// Captures: [1] = note name, [2] = optional section/block reference (including #)
export const LINKED_NOTES_REGEX = /!\[\[([^\]#]+)(#[^\]]+)?\]\]/g

export interface ParsedNoteReference {
  noteName: string
  section?: string
  blockId?: string
}

export function parseNoteReference(fullReference: string): ParsedNoteReference {
  const hashIndex = fullReference.indexOf("#")

  if (hashIndex === -1) {
    return { noteName: fullReference.trim() }
  }

  const noteName = fullReference.substring(0, hashIndex).trim()
  const fragment = fullReference.substring(hashIndex + 1)

  if (fragment.startsWith("^")) {
    return { noteName, blockId: fragment.substring(1) }
  }

  return { noteName, section: fragment }
}

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

export async function readNoteContent(
  app: App,
  noteFile: TFile
): Promise<string> {
  try {
    return await app.vault.read(noteFile)
  } catch (error) {
    console.error(`Error reading note content: ${noteFile.path}`, error)
    throw error
  }
}

export function removeFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/
  return content.replace(frontmatterRegex, "")
}

export function isCircularReference(
  processingStack: Set<string>,
  noteName: string
): boolean {
  return processingStack.has(noteName)
}

export function isContentTooLarge(content: string, maxSize: number): boolean {
  return content.length > maxSize
}

export function sanitizeNoteName(noteName: string): string {
  return noteName.trim()
}

export function createCacheKey(
  noteName: string,
  depth: number,
  section?: string,
  blockId?: string
): string {
  const fragment = section ? `#${section}` : blockId ? `#^${blockId}` : ""
  return `${noteName}${fragment}-${depth}`
}

/**
 * Extracts content under a specific heading from markdown content.
 * Returns content from the heading until the next heading of same or higher level.
 */
export function extractSectionContent(
  content: string,
  sectionName: string
): string | null {
  const lines = content.split("\n")
  const sectionNameLower = sectionName.toLowerCase()

  let capturing = false
  let capturedLevel = 0
  const capturedLines: string[] = []

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      const level = headingMatch[1].length
      const headingText = headingMatch[2].trim().toLowerCase()

      if (capturing) {
        // Stop if we hit a heading of same or higher level
        if (level <= capturedLevel) {
          break
        }
      } else if (headingText === sectionNameLower) {
        // Start capturing from this heading
        capturing = true
        capturedLevel = level
        capturedLines.push(line)
        continue
      }
    }

    if (capturing) {
      capturedLines.push(line)
    }
  }

  if (capturedLines.length === 0) {
    return null
  }

  return capturedLines.join("\n").trim()
}

/**
 * Extracts a block identified by ^block-id from markdown content.
 * Blocks are paragraphs or list items ending with ^block-id.
 */
export function extractBlockContent(
  content: string,
  blockId: string
): string | null {
  const blockPattern = new RegExp(`\\^${escapeRegex(blockId)}\\s*$`, "m")
  const lines = content.split("\n")

  for (let i = 0; i < lines.length; i++) {
    if (blockPattern.test(lines[i])) {
      // Found the line with the block ID
      const blockLine = lines[i].replace(blockPattern, "").trim()

      // Check if it's a list item - include just the item
      if (/^[-*+]\s|^\d+\.\s/.test(blockLine)) {
        return blockLine
      }

      // For paragraphs, collect the entire paragraph (contiguous non-empty lines)
      const paragraphLines: string[] = []

      // Go backwards to find paragraph start
      let start = i
      while (start > 0 && lines[start - 1].trim() !== "") {
        start--
      }

      // Go forwards to find paragraph end
      let end = i
      while (end < lines.length && lines[end].trim() !== "") {
        end++
      }

      for (let j = start; j < end; j++) {
        const line = lines[j].replace(blockPattern, "").trim()
        if (line) {
          paragraphLines.push(line)
        }
      }

      return paragraphLines.join("\n")
    }
  }

  return null
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
