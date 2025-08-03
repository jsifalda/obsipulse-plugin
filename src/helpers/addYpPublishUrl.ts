import { App, TFile } from 'obsidian'

export async function addYpPublishUrlToFile(file: TFile, app: App, url: string): Promise<void> {
  try {
    app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter['yp-publish-url'] = url
    })
  } catch (error) {
    console.error('[yourpulse] error adding yp-publish-url to file:', error)
  }
}
