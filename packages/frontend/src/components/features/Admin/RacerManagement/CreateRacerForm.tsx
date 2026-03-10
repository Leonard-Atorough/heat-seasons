import { useRef, useEffect } from "react";
import { Card, Toast } from "../../../common";
import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { RacerForm } from "./RacerForm";
import { FormErrors, validate } from "./racerValidation";
import styles from "../RacerManagementTab.module.css";

interface CreateRacerFormProps {
  form: AdminCreateRacerInput;
  errors: FormErrors;
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  successMsg: string | null;
  errorMsg: string | null;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onValidationErrorsChange: (errors: FormErrors) => void;
  onFormReset: () => void;
  onSubmit: (payload: AdminCreateRacerInput) => Promise<void>;
  onSuccessClose: () => void;
  onErrorClose: () => void;
}

export function CreateRacerForm({
  form,
  errors,
  users,
  isLoadingUsers,
  isSubmitting,
  successMsg,
  errorMsg,
  onFormChange,
  onValidationErrorsChange,
  onFormReset,
  onSubmit,
  onSuccessClose,
  onErrorClose,
}: CreateRacerFormProps) {
  const errorToastRef = useRef<HTMLDivElement>(null);
  const hasFieldErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (hasFieldErrors) {
      errorToastRef.current?.focus();
    }
  }, [hasFieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      onValidationErrorsChange(validationErrors);
      return;
    }

    onValidationErrorsChange({});

    const payload: AdminCreateRacerInput = {
      ...form,
      userId: form.userId?.trim() || undefined,
      badgeUrl: form.badgeUrl?.trim() || undefined,
    };

    await onSubmit(payload);
  };

  const validationErrorList = Object.values(errors).filter(Boolean) as string[];

  return (
    <>
      <h2 className={styles.title}>Create Racer</h2>
      <p className={styles.subtitle}>
        Create a racer profile and optionally assign it to an existing player account.
      </p>

      {/* -- Validation summary toast -------------------------------- */}
      {hasFieldErrors && (
        <div ref={errorToastRef}>
          <Toast
            type="error"
            title="Please fix the following errors"
            message={validationErrorList.join("\n")}
            onClose={() => onValidationErrorsChange({})}
          />
        </div>
      )}

      {/* -- Submit-level error toast -------------------------------- */}
      {errorMsg && (
        <Toast
          type="error"
          title="Failed to create racer"
          message={errorMsg}
          onClose={onErrorClose}
        />
      )}

      {/* -- Success toast ------------------------------------------- */}
      {successMsg && (
        <Toast type="success" title="Racer created" message={successMsg} onClose={onSuccessClose} />
      )}

      <Card className={styles.formCard}>
        <RacerForm
          form={form}
          errors={errors}
          users={users}
          isLoadingUsers={isLoadingUsers}
          isSubmitting={isSubmitting}
          onChange={onFormChange}
          onSubmit={handleSubmit}
          onReset={onFormReset}
          submitButtonText="Create Racer"
          showResetButton={true}
        />
      </Card>
    </>
  );
}
