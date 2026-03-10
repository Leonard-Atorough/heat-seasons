import { Racer } from "shared";
import { Modal, Toast, Button } from "../../../common";
import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { RacerForm } from "./RacerForm";
import { FormErrors, validate } from "./racerValidation";
import styles from "../RacerManagementTab.module.css";

interface EditRacerModalProps {
  editingRacer: Racer | null;
  editForm: AdminCreateRacerInput;
  errors: FormErrors;
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  errorMsg: string | null;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onValidationErrorsChange: (errors: FormErrors) => void;
  onClose: () => void;
  onSubmit: (racerId: string, payload: AdminCreateRacerInput) => Promise<void>;
  onErrorClose: () => void;
}

export function EditRacerModal({
  editingRacer,
  editForm,
  errors,
  users,
  isLoadingUsers,
  isSubmitting,
  errorMsg,
  onFormChange,
  onValidationErrorsChange,
  onClose,
  onSubmit,
  onErrorClose,
}: EditRacerModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRacer) return;

    const validationErrors = validate(editForm);
    if (Object.keys(validationErrors).length > 0) {
      onValidationErrorsChange(validationErrors);
      return;
    }

    onValidationErrorsChange({});

    const payload: AdminCreateRacerInput = {
      ...editForm,
      userId: editForm.userId?.trim() || undefined,
      badgeUrl: editForm.badgeUrl?.trim() || undefined,
    };

    await onSubmit(editingRacer.id, payload);
  };

  return (
    <Modal
      isOpen={editingRacer !== null}
      onClose={onClose}
      title={`Edit "${editingRacer?.name ?? "Racer"}"`}
    >
      {errorMsg && (
        <Toast
          type="error"
          title="Failed to update racer"
          message={errorMsg}
          onClose={onErrorClose}
        />
      )}

      <RacerForm
        form={editForm}
        errors={errors}
        users={users}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isSubmitting}
        onChange={onFormChange}
        onSubmit={handleSubmit}
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
