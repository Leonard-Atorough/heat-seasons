import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRacerSchema } from "shared";
import { AdminCreateRacerInput, AdminUser } from "../../../../models";
import { Button, FormGroup, LoadingSkeletonCard } from "../../../common";
import styles from "../RacerManagementTab.module.css";

interface RacerFormProps {
  defaultValues: AdminCreateRacerInput;
  users: AdminUser[];
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  onValidSubmit: (data: AdminCreateRacerInput) => Promise<void>;
  onReset?: () => void;
  submitButtonText?: string;
  showResetButton?: boolean;
}

export function RacerForm({
  defaultValues,
  users,
  isLoadingUsers,
  isSubmitting,
  onValidSubmit,
  onReset,
  submitButtonText = "Submit",
  showResetButton = true,
}: RacerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AdminCreateRacerInput>({ resolver: zodResolver(createRacerSchema) as any, defaultValues });

  const teamColor = watch("teamColor");

  const onSubmit: SubmitHandler<AdminCreateRacerInput> = async (data) => {
    await onValidSubmit(data);
    reset(defaultValues);
  };

  const handleReset = () => {
    reset(defaultValues);
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {/* -- Basic info ------------------------------------------ */}
      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-name"
          type="text"
          label="Name"
          placeholder="e.g. Max Verstappen"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <FormGroup
          element="input"
          id="racer-nationality"
          type="text"
          label="Nationality"
          placeholder="e.g. Dutch"
          required
          error={errors.nationality?.message}
          {...register("nationality")}
        />
      </div>

      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-team"
          type="text"
          label="Team"
          placeholder="e.g. Red Bull Racing"
          required
          error={errors.team?.message}
          {...register("team")}
        />

        <FormGroup element="default" id="racer-teamColor" label="Team Colour" required>
          <div className={styles.colorRow}>
            <input
              id="racer-teamColor"
              type="color"
              className={styles.colorPicker}
              aria-label="Team colour picker"
              {...register("teamColor")}
            />
            <span className={styles.colorHex} aria-hidden="true">
              {teamColor}
            </span>
          </div>
        </FormGroup>
      </div>

      <div className={styles.row}>
        <FormGroup
          element="input"
          id="racer-age"
          type="number"
          label="Age"
          required
          min={8}
          max={120}
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
        <FormGroup
          element="input"
          id="racer-badgeUrl"
          type="url"
          label="Badge URL (optional)"
          placeholder="https://..."
          error={errors.badgeUrl?.message}
          {...register("badgeUrl")}
        />
      </div>

      {/* -- User assignment ------------------------------------- */}
      <FormGroup element="default" id="racer-userId" label="Assign to player (optional)">
        {isLoadingUsers ? (
          <LoadingSkeletonCard includeTitle={false} maxWidth="100%" testId="racer-users-loading" />
        ) : (
          <select
            id="racer-userId"
            className={styles.select}
            {...register("userId")}
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
          className={styles.checkbox}
          {...register("active")}
        />
      </FormGroup>

      <div className={styles.formActions}>
        {showResetButton && (
          <Button type="button" variant="ghost" onClick={handleReset} disabled={isSubmitting}>
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
