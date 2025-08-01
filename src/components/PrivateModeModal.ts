import { Modal } from 'obsidian'

/**
 * Modal component for private mode interactions
 * Displays local content instead of redirecting to external pages
 */
export class PrivateModeModal extends Modal {
  private content: string

  constructor(app: any, content: string = 'hello') {
    super(app)
    this.content = content
  }

  onOpen(): void {
    const { contentEl } = this
    contentEl.empty()

    // Create modal container
    const container = contentEl.createDiv('private-mode-modal')

    // Add header
    const header = container.createDiv('private-mode-modal-header')
    header.createEl('h2', { text: 'YourPulse - Private Mode' })

    // Add content area
    const contentArea = container.createDiv('private-mode-modal-content')
    contentArea.createEl('p', { text: this.content })

    // Add footer with close button
    const footer = container.createDiv('private-mode-modal-footer')
    const closeButton = footer.createEl('button', {
      text: 'Close',
      cls: 'mod-cta',
    })

    closeButton.addEventListener('click', () => {
      this.close()
    })

    // Add keyboard support for closing
    this.scope.register([], 'Escape', () => {
      this.close()
    })
  }

  onClose(): void {
    const { contentEl } = this
    contentEl.empty()
  }
}
