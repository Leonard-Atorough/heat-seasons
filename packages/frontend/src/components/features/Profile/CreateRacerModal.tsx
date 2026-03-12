import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRacerSchema, CreateRacerInput } from "shared";
import { FormGroup, Modal, Button, Toast } from "../../common";
import { createRacer } from "../../../services/api/racer";
import styles from "./CreateRacerModal.module.css";

export interface CreateRacerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new racer id after a successful create. */
  onCreated: () => void;
}

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

export function CreateRacerModal({ isOpen, onClose, onCreated }: CreateRacerModalProps) {
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
      name: "",
      team: "",
      teamColor: TEAM_COLORS[0].value,
      nationality: "",
      age: undefined as unknown as number,
      active: true,
    },
  });

  const watchedColor = watch("teamColor");

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const handleFormSubmit = async (data: CreateRacerInput) => {
    setApiError(null);
    try {
      await createRacer(data);
      reset();
      onCreated();
    } catch (err: any) {
      const message = err?.data?.message ?? err?.message ?? "Failed to create racer.";
      if (err?.status === 409 || message.toLowerCase().includes("already")) {
        setApiError({ title: "Error", message: "You already have a racer linked to your account." });
      } else {
        setApiError({ title: "Error", message });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Racer">
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
          id="racerName"
          type="text"
          placeholder="e.g. Lewis Hamilton"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormGroup
          element="input"
          label="Team"
          id="racerTeam"
          type="text"
          placeholder="e.g. Mercedes AMG"
          error={errors.team?.message}
          {...register("team")}
        />
        <FormGroup element="default" label="Team Colour" id="racerTeamColor" error={errors.teamColor?.message}>
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
          id="racerNationality"
          type="text"
          placeholder="e.g. British"
          error={errors.nationality?.message}
          {...register("nationality")}
        />
        <FormGroup
          element="input"
          label="Age"
          id="racerAge"
          type="number"
          placeholder="e.g. 30"
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Racer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
