import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Body className="text-center pt-8">
        <div className="h-12 w-12 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationTriangle className="h-6 w-6 text-danger-500" />
        </div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      </Modal.Body>
      <Modal.Footer className="justify-center">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading} className="flex-1">
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
