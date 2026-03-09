import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, FormGroup, LoadingSkeletonCard, Toast } from "../../common";
import {
  AdminUser,
  AdminCreateRacerInput,
  adminListUsers,
  adminCreateRacer,
} from "../../../services/api/admin";
import styles from "./RacerManagementTab.module.css";

const EMPTY_FORM: AdminCreateRacerInput = {
  name: "",
  team: "",
  teamColor: "#e63946",
  nationality: "",
  age: 25,
  active: true,
  badgeUrl: "",
  userId: "",
};

type FormErrors = Partial<Record<keyof AdminCreateRacerInput, string>>;

function validate(form: AdminCreateRacerInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Racer name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!form.nationality.trim()) {
    errors.nationality = "Nationality is required.";
  } else if (form.nationality.trim().length < 2) {
    errors.nationality = "Nationality must be at least 2 characters.";
  }

  if (!form.team.trim()) {
    errors.team = "Team name is required.";
  } else if (form.team.trim().length < 2) {
    errors.team = "Team must be at least 2 characters.";
  }

  const age = Number(form.age);
  if (!age || age < 16 || age > 80) {
    errors.age = "Age must be between 16 and 80.";
  }

  const badge = form.badgeUrl?.trim();
  if (badge) {
    try {
      new URL(badge);
    } catch {
      errors.badgeUrl = "Badge URL must be a valid URL (e.g. https://...).";
    }
  }

  return errors;
}

export default function RacerManagementTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [form, setForm] = useState<AdminCreateRacerInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep a ref to the validation-error toast so we can focus it for screen
  // readers as soon as it mounts (the element already has tabIndex={0}).
  const errorToastRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch {
      // non-critical - user list is optional for unassigned racers
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  // Move focus to the error summary toast when it first appears so assistive
  // technology announces it without requiring the user to navigate to it.
  useEffect(() => {
    if (hasFieldErrors) {
      errorToastRef.current?.focus();
    }
  }, [hasFieldErrors]);

  // handleChange is typed to cover all three form element types so it can be
  // passed both to FormGroup (HTMLInputElement | HTMLTextAreaElement) and to
  // the raw <select> and <input type="checkbox"> children.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    // Clear the per-field error as soon as the user edits the field.
    if (fieldErrors[name as keyof AdminCreateRacerInput]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof AdminCreateRacerInput];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setSubmitError(null);

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const payload: AdminCreateRacerInput = {
      ...form,
      userId: form.userId?.trim() || undefined,
      badgeUrl: form.badgeUrl?.trim() || undefined,
    };

    try {
      const created = await adminCreateRacer(payload);
      setSuccessMsg(`Racer "${created.name}" created successfully.`);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create racer.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationErrorList = Object.values(fieldErrors).filter(Boolean) as string[];

  return (
    <div className={styles.container}>
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
            message={validationErrorList.join(" * ")}
            onClose={() => setFieldErrors({})}
          />
        </div>
      )}

      {/* -- Submit-level error toast -------------------------------- */}
      {submitError && (
        <Toast
          type="error"
          title="Failed to create racer"
          message={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      {/* -- Success toast ------------------------------------------- */}
      {successMsg && (
        <Toast
          type="success"
          title="Racer created"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      <Card className={styles.formCard}>
        {/*
          noValidate disables the browser-native validation popover so it does
          not compete with our custom per-field errors and the summary toast.
        */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
              onChange={handleChange}
              required
              error={fieldErrors.name}
            />
            <FormGroup
              element="input"
              id="racer-nationality"
              name="nationality"
              type="text"
              label="Nationality"
              placeholder="e.g. Dutch"
              value={form.nationality}
              onChange={handleChange}
              required
              error={fieldErrors.nationality}
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
              onChange={handleChange}
              required
              error={fieldErrors.team}
            />

            {/*
              Color picker uses FormGroup default (children) case to keep the
              custom colour-row layout while still getting the label + required
              indicator from FormGroup.
            */}
            <FormGroup
              element="default"
              id="racer-teamColor"
              label="Team Colour"
              required
            >
              <div className={styles.colorRow}>
                <input
                  id="racer-teamColor"
                  name="teamColor"
                  type="color"
                  className={styles.colorPicker}
                  value={form.teamColor}
                  onChange={handleChange}
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
              onChange={handleChange}
              required
              min={16}
              max={80}
              error={fieldErrors.age}
            />
            <FormGroup
              element="input"
              id="racer-badgeUrl"
              name="badgeUrl"
              type="url"
              label="Badge URL (optional)"
              placeholder="https://..."
              value={form.badgeUrl}
              onChange={handleChange}
              error={fieldErrors.badgeUrl}
            />
          </div>

          {/* -- User assignment ------------------------------------- */}
          <FormGroup
            element="default"
            id="racer-userId"
            label="Assign to player (optional)"
          >
            {isLoadingUsers ? (
              <LoadingSkeletonCard
                includeTitle={false}
                maxWidth="100%"
                testId="racer-users-loading"
              />
            ) : (
              <select
                id="racer-userId"
                name="userId"
                className={styles.select}
                value={form.userId}
                onChange={handleChange}
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
              onChange={handleChange}
              className={styles.checkbox}
            />
          </FormGroup>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFieldErrors({});
              }}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Racer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
