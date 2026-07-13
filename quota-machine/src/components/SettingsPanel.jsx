import { useState } from 'react'
import Modal from './Modal.jsx'
import { isMuted, setMuted } from '../audio.js'

export default function SettingsPanel({ onClose }) {
  const [muted, setMutedState] = useState(isMuted())
  function toggleMute() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="settings-row">
        <span>Sound</span>
        <button onClick={toggleMute} className="settings-toggle">
          {muted ? 'Off' : 'On'}
        </button>
      </div>
    </Modal>
  )
}
