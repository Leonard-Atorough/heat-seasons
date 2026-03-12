import { Card, Toast } from "../../../common";
import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { RacerForm } from "./RacerForm";
import { EMPTY_FORM } from "./racerValidation";
import styles from "../RacerManagementTab.module.css";

interface CreateRacerFormProps {
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  successMsg: string | null;
  errorMsg: string | null;
  onSubmit: (payload: AdminCreateRacerInput) => Promise<void>;
  onSuccessClose: () => void;
  onErrorClose: () => void;
}

export function CreateRacerForm({
  users,
  isLoadingUsers,
  isSubmitting,
  successMsg,
  errorMsg,
  onSubmit,
  onSuccessClose,
  onErrorClose,
}: CreateRacerFormProps) {
  return (
    <>
      <h2 className={styles.title}>Create Racer</h2>
      <p className={styles.subtitle}>
        Create a racer profile and optionally assign it to an existing player account.
      </p>

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
          defaultValues={EMPTY_FORM}
          users={users}
          isLoadingUsers={isLoadingUsers}
          isSubmitting={isSubmitting}
          onValidSubmit={onSubmit}
          submitButtonText="Create Racer"
          showResetButton={true}
        />
      </Card>
    </>
  );
}
