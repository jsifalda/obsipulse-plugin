import { App, TFile } from 'obsidian'

/**
 * Checks if a file has frontmatter with yp-publish: true
 */
export async function hasYpPublishFileProperty(file: TFile, app: App): Promise<boolean> {
  try {
    const content = await app.vault.read(file)
    // Match YAML frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return false
    const frontmatter = match[1]
    // Look for yp-publish: true (allow whitespace)
    return /^\s*yp-publish\s*:\s*true\s*$/m.test(frontmatter)
  } catch {
    return false
  }
}
