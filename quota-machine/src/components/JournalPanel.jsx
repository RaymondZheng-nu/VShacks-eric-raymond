import Modal from './Modal.jsx'

// stub no journal content yet
// props onclose
export default function JournalPanel({ onClose }) {
  return (
    <Modal title="Journal" onClose={onClose}>
      <p>Coming soon.</p>
    </Modal>
  )
}
