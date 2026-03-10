import { Racer } from "shared";
import { Modal, Toast, Button } from "../../../common";
import styles from "../RacerManagementTab.module.css";

interface DeleteRacerModalProps {
  deletingRacer: Racer | null;
  isDeleting: boolean;
  errorMsg: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onErrorClose: () => void;
}

export function DeleteRacerModal({
  deletingRacer,
  isDeleting,
  errorMsg,
  onClose,
  onConfirm,
  onErrorClose,
}: DeleteRacerModalProps) {
  return (
    <Modal isOpen={deletingRacer !== null} onClose={onClose} title="Delete Racer">
      <div className={styles.deleteConfirm}>
        <p>
          Are you sure you want to delete <strong>{deletingRacer?.name}</strong>? This action
          cannot be undone.
        </p>

        {errorMsg && (
          <Toast
            type="error"
            title="Failed to delete racer"
            message={errorMsg}
            onClose={onErrorClose}
          />
        )}

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
