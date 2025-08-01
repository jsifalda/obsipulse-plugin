import { Modal } from 'obsidian'
import { renderModalContent, unmountModalContent } from './PrivateModeModalContent'

/**
 * Modal component for private mode interactions
 * Displays local content instead of redirecting to external pages
 */
export class PrivateModeModal extends Modal {
  private content: string

  constructor(app: any, content?: string) {
    super(app)
    this.content = content
  }

  onOpen(): void {
    const { contentEl } = this
    contentEl.empty()

    // Render React component into modal
    renderModalContent(contentEl, this.content, () => {
      this.close()
    })

    // Add keyboard support for closing
    this.scope.register([], 'Escape', () => {
      this.close()
    })
  }

  onClose(): void {
    const { contentEl } = this
    unmountModalContent(contentEl)
    contentEl.empty()
  }
}
