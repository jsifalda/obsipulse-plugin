import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import ReactDOM from 'react-dom'
import { VaultDetail } from './VaultDetail'

interface PrivateModeModalContentProps {
  data: any
  onClose: () => void
}

export const PrivateModeModalContent: React.FC<PrivateModeModalContentProps> = ({ data, onClose }) => {
  return (
    <div className="private-mode-modal">
      <div className="private-mode-modal-header">
        <h1 className="text-2xl font-bold">YourPulse - Private Mode</h1>
      </div>

      <div className="private-mode-modal-content">
        <VaultDetail vault={data} />
      </div>

      {/* <div className="private-mode-modal-footer">
        <button className="mod-cta" onClick={onClose}>
          Close
        </button>
      </div> */}
    </div>
  )
}

export const renderModalContent = (container: HTMLElement, data: any, onClose: () => void) => {
  ReactDOM.render(<PrivateModeModalContent data={data} onClose={onClose} />, container)
}

export const unmountModalContent = (container: HTMLElement) => {
  ReactDOM.unmountComponentAtNode(container)
}
