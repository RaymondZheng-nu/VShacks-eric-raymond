import Modal from './Modal.jsx'

// Stub — no journal content yet.
// Props: { onClose: () => void }
export default function JournalPanel({ onClose }) {
  return (
    <Modal title="Journal" onClose={onClose}>
      <p>Coming soon.</p>
    </Modal>
  )
}
