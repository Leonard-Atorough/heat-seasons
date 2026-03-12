import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RacerWithStats, createRacerSchema, CreateRacerInput } from "shared";
import { FormGroup, Modal, Button, Toast } from "../../common";
import { updateRacer } from "../../../services/api/racer";
import styles from "./CreateRacerModal.module.css"; // same shape — reuse styles

const TEAM_COLORS = [
  { label: "Red", value: "#e8002d" },
  { label: "Blue", value: "#0600ef" },
  { label: "Orange", value: "#ff8000" },
  { label: "Green", value: "#00d2be" },
  { label: "Yellow", value: "#ffd700" },
  { label: "Purple", value: "#960000" },
  { label: "Silver", value: "#c0c0c0" },
  { label: "Black", value: "#1e1e1e" },
];

export interface EditRacerModalProps {
  racer: RacerWithStats;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditRacerModal({ racer, isOpen, onClose, onUpdated }: EditRacerModalProps) {
  const [apiError, setApiError] = useState<{ title: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateRacerInput>({
    resolver: zodResolver(createRacerSchema) as any,
    defaultValues: {
      name: racer.name,
      team: racer.team,
      teamColor: TEAM_COLORS.some((c) => c.value === racer.teamColor)
        ? racer.teamColor
        : TEAM_COLORS[0].value,
      nationality: racer.nationality,
      age: racer.age,
      active: racer.active,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: racer.name,
        team: racer.team,
        teamColor: TEAM_COLORS.some((c) => c.value === racer.teamColor)
          ? racer.teamColor
          : TEAM_COLORS[0].value,
        nationality: racer.nationality,
        age: racer.age,
        active: racer.active,
      });
      setApiError(null);
    }
  }, [isOpen, racer.id]);

  const watchedColor = watch("teamColor");
  const watchedActive = watch("active");

  const handleFormSubmit = async (data: CreateRacerInput) => {
    setApiError(null);
    try {
      await updateRacer(racer.id, data);
      onUpdated();
    } catch (err: any) {
      setApiError({
        title: "Error",
        message: err?.data?.message ?? err?.message ?? "Failed to update racer.",
      });
    }
  };

  const handleClose = () => {
    setApiError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Racer Profile">
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {apiError && (
          <Toast
            type="error"
            title={apiError.title}
            message={apiError.message}
            onClose={() => setApiError(null)}
          />
        )}
        <FormGroup
          element="input"
          label="Racer Name"
          id="editRacerName"
          type="text"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormGroup
          element="input"
          label="Team"
          id="editRacerTeam"
          type="text"
          error={errors.team?.message}
          {...register("team")}
        />
        <FormGroup
          element="default"
          label="Team Colour"
          id="editRacerTeamColor"
          error={errors.teamColor?.message}
        >
          <div className={styles.colorPicker}>
            {TEAM_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.colorSwatch} ${watchedColor === c.value ? styles["colorSwatch--selected"] : ""}`}
                style={{ backgroundColor: c.value }}
                title={c.label}
                onClick={() => setValue("teamColor", c.value, { shouldValidate: true })}
                aria-label={`${c.label}${watchedColor === c.value ? " (selected)" : ""}`}
              />
            ))}
          </div>
        </FormGroup>
        <FormGroup
          element="input"
          label="Nationality"
          id="editRacerNationality"
          type="text"
          error={errors.nationality?.message}
          {...register("nationality")}
        />
        <FormGroup
          element="input"
          label="Age"
          id="editRacerAge"
          type="number"
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
        <FormGroup element="default" label="Status" id="editRacerActive">
          <label className={styles.toggle}>
            <input type="checkbox" {...register("active")} />
            <span>{watchedActive ? "Active" : "Inactive"}</span>
          </label>
        </FormGroup>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
