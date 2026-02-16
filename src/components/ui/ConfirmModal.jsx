import { useEffect, useRef } from 'react';
import { TouchButton } from './TouchButton';
import './ConfirmModal.css';

export const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', variant = 'danger' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" ref={modalRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title || 'Are you sure?'}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <TouchButton variant="secondary" onClick={onCancel}>
            Cancel
          </TouchButton>
          <TouchButton variant={variant} onClick={onConfirm}>
            {confirmText}
          </TouchButton>
        </div>
      </div>
    </div>
  );
};
