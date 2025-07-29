export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="btn-confirm">Yes</button>
          <button onClick={onCancel} className="btn-cancel">No</button>
        </div>
      </div>
    </div>
  );
}
