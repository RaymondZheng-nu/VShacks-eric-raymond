import Modal from './Modal.jsx'

// Stub — no settings content yet.
// Props: { onClose: () => void }
export default function SettingsPanel({ onClose }) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <p>Coming soon.</p>
    </Modal>
  )
}
