import { Modal } from 'obsidian'
import { renderModalContent, unmountModalContent } from './PrivateModeModalContent'

/**
 * Modal component for private mode interactions
 * Displays local content instead of redirecting to external pages
 */
export class PrivateModeModal extends Modal {
  private data: any

  constructor(app: any, data: any) {
    super(app)
    this.data = data
  }

  onOpen(): void {
    const { contentEl } = this
    contentEl.empty()

    // Render React component into modal
    renderModalContent(contentEl, this.data, () => {
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
