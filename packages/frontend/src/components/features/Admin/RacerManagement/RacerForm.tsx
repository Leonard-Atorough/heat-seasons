import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { Button, FormGroup, LoadingSkeletonCard } from "../../../common";
import { FormErrors } from "./racerValidation";
import styles from "../RacerManagementTab.module.css";

interface RacerFormProps {
  form: AdminCreateRacerInput;
  errors: FormErrors;
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset?: () => void;
  submitButtonText?: string;
  showResetButton?: boolean;
}

export function RacerForm({
  form,
  errors,
  users,
  isLoadingUsers,
  isSubmitting,
  onChange,
  onSubmit,
  onReset,
  submitButtonText = "Submit",
  showResetButton = true,
}: RacerFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      {/* -- Basic info ------------------------------------------ */}
      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-name"
          name="name"
          type="text"
          label="Name"
          placeholder="e.g. Max Verstappen"
          value={form.name}
          onChange={onChange}
          required
          error={errors.name}
        />
        <FormGroup
          element="input"
          id="racer-nationality"
          name="nationality"
          type="text"
          label="Nationality"
          placeholder="e.g. Dutch"
          value={form.nationality}
          onChange={onChange}
          required
          error={errors.nationality}
        />
      </div>

      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-team"
          name="team"
          type="text"
          label="Team"
          placeholder="e.g. Red Bull Racing"
          value={form.team}
          onChange={onChange}
          required
          error={errors.team}
        />

        <FormGroup element="default" id="racer-teamColor" label="Team Colour" required>
          <div className={styles.colorRow}>
            <input
              id="racer-teamColor"
              name="teamColor"
              type="color"
              className={styles.colorPicker}
              value={form.teamColor}
              onChange={onChange}
              aria-label="Team colour picker"
            />
            <span className={styles.colorHex} aria-hidden="true">
              {form.teamColor}
            </span>
          </div>
        </FormGroup>
      </div>

      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-age"
          name="age"
          type="number"
          label="Age"
          value={form.age}
          onChange={onChange}
          required
          min={16}
          max={80}
          error={errors.age}
        />
        <FormGroup
          element="input"
          id="racer-badgeUrl"
          name="badgeUrl"
          type="url"
          label="Badge URL (optional)"
          placeholder="https://..."
          value={form.badgeUrl}
          onChange={onChange}
          error={errors.badgeUrl}
        />
      </div>

      {/* -- User assignment ------------------------------------- */}
      <FormGroup element="default" id="racer-userId" label="Assign to player (optional)">
        {isLoadingUsers ? (
          <LoadingSkeletonCard includeTitle={false} maxWidth="100%" testId="racer-users-loading" />
        ) : (
          <select
            id="racer-userId"
            name="userId"
            className={styles.select}
            value={form.userId}
            onChange={onChange}
          >
            <option value="">None (unassigned)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}
      </FormGroup>

      {/* -- Active flag ----------------------------------------- */}
      <FormGroup element="default" id="racer-active" label="Active racer">
        <input
          id="racer-active"
          type="checkbox"
          name="active"
          checked={form.active ?? true}
          onChange={onChange}
          className={styles.checkbox}
        />
      </FormGroup>

      <div className={styles.formActions}>
        {showResetButton && (
          <Button type="button" variant="ghost" onClick={onReset} disabled={isSubmitting}>
            Reset
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? `${submitButtonText.split(" ")[0]}...` : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
