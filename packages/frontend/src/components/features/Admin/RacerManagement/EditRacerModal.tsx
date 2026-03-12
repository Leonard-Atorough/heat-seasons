import { Racer } from "shared";
import { Modal, Toast, Button } from "../../../common";
import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { RacerForm } from "./RacerForm";
import styles from "../RacerManagementTab.module.css";

interface EditRacerModalProps {
  editingRacer: Racer | null;
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  errorMsg: string | null;
  onClose: () => void;
  onSubmit: (racerId: string, payload: AdminCreateRacerInput) => Promise<void>;
  onErrorClose: () => void;
}

export function EditRacerModal({
  editingRacer,
  users,
  isLoadingUsers,
  isSubmitting,
  errorMsg,
  onClose,
  onSubmit,
  onErrorClose,
}: EditRacerModalProps) {
  if (!editingRacer) return null;

  const defaultValues: AdminCreateRacerInput = {
    name: editingRacer.name,
    team: editingRacer.team,
    teamColor: editingRacer.teamColor,
    nationality: editingRacer.nationality,
    age: editingRacer.age,
    active: editingRacer.active,
    badgeUrl: editingRacer.badgeUrl ?? "",
    userId: editingRacer.userId ?? "",
  };

  return (
    <Modal isOpen={editingRacer !== null} onClose={onClose} title={`Edit "${editingRacer.name}"`}>
      {errorMsg && (
        <Toast
          type="error"
          title="Failed to update racer"
          message={errorMsg}
          onClose={onErrorClose}
        />
      )}

      <RacerForm
        key={editingRacer.id}
        defaultValues={defaultValues}
        users={users}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isSubmitting}
        onValidSubmit={(data) => onSubmit(editingRacer.id, data)}
        submitButtonText="Save Changes"
        showResetButton={false}
      />

      <div className={styles.formActions}>
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
