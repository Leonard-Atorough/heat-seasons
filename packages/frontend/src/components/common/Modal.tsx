import { Button } from "./Button";
import { Card } from "./Card";
import styles from "./Modal.module.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <Card
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-title" tabIndex={-1}>
            {title}
          </h2>
          <Button
            type="button"
            variant="none"
            className={styles.modalCloseButton}
            aria-label="Close"
            data-testid="modal-close-button"
            onClick={onClose}
          >
            &times;
          </Button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </Card>
    </div>
  );
}
