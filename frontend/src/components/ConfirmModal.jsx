function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant }) {
  if (!isOpen) return null;

  const variantClass = variant === "danger" ? "confirm-modal-danger" : "";

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal ${variantClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {variant === "danger" ? "⚠️" : "❓"}
        </div>
        <h3 className="confirm-modal-title">{title || "Confirm Action"}</h3>
        <p className="confirm-modal-message">{message || "Are you sure?"}</p>
        <div className="confirm-modal-actions">
          <button className="btn confirm-modal-cancel" onClick={onCancel}>
            {cancelText || "Cancel"}
          </button>
          <button
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
