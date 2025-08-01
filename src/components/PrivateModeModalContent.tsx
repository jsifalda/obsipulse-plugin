import React from 'react'
import ReactDOM from 'react-dom'

interface PrivateModeModalContentProps {
  content: string
  onClose: () => void
}

export const PrivateModeModalContent: React.FC<PrivateModeModalContentProps> = ({ content, onClose }) => {
  return (
    <div className="private-mode-modal">
      <div className="private-mode-modal-header">
        <h2>YourPulse - Private Mode</h2>
      </div>

      <div className="private-mode-modal-content">
        are you sure???
        <p>{content}</p>
      </div>

      <div className="private-mode-modal-footer">
        <button className="mod-cta" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export const renderModalContent = (container: HTMLElement, content: string, onClose: () => void) => {
  ReactDOM.render(<PrivateModeModalContent content={content} onClose={onClose} />, container)
}

export const unmountModalContent = (container: HTMLElement) => {
  ReactDOM.unmountComponentAtNode(container)
}
