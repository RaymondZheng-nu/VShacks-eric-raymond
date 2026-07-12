import Modal from './Modal.jsx'

// stub no settings content yet
// props onclose
export default function SettingsPanel({ onClose }) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <p>Coming soon.</p>
    </Modal>
  )
}
