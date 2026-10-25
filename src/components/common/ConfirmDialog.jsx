// src/components/common/ConfirmDialog.jsx
import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm Delete',
  confirmVariant = 'danger',
  icon: CustomIcon
}) {
  const Icon = CustomIcon || (confirmVariant === 'danger' ? Trash2 : AlertTriangle);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={Icon} size="sm">
      <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'} btn-sm`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
