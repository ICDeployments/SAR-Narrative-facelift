 import React from 'react';
 import './ConfirmationModal.css'; // Import CSS for styling
 
 const ConfirmationModal = ({ isOpen, onClose, onConfirm, confirmLabel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
  <div className="modal-content">
    <h3>
      Are you sure you want to upload a new file? 
      This will overwrite your existing data
    </h3>
    
    <div className="modal-actions">
      <button className="btn btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" onClick={onConfirm}>
        {confirmLabel || "Upload File"}
      </button>
    </div>
  </div>
</div>
  );
};

export default ConfirmationModal;