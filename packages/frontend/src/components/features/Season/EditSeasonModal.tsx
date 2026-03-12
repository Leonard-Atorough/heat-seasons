import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Season, SeasonStatus } from "shared";
import { updateSeason } from "../../../services/api/season";
import { FormGroup, Modal, Button, Toast } from "../../common";
import styles from "./EditSeasonModal.module.css";

const STATUS_OPTIONS: { value: SeasonStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Season name is required")
    .min(2, "Season name must be at least 2 characters"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  status: z.enum(["upcoming", "active", "completed", "archived"] as const),
});

type FormValues = z.infer<typeof schema>;

export interface EditSeasonModalProps {
  season: Season;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function EditSeasonModal({ season, isOpen, onClose, onSubmit }: EditSeasonModalProps) {
  const [apiError, setApiError] = useState<{ title: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: season.name,
      startDate: new Date(season.startDate).toISOString().split("T")[0],
      status: season.status,
    },
  });

  const watchedStatus = watch("status");
  const willAutoSetEndDate =
    (watchedStatus === "completed" || watchedStatus === "archived") && !season.endDate;

  const handleFormSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      await updateSeason(season.id, {
        name: data.name,
        startDate: new Date(data.startDate).toISOString(),
        status: data.status,
      });
      onSubmit();
    } catch {
      setApiError({
        title: "Update Failed",
        message: "Failed to update season. Please try again.",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Season">
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {apiError && <Toast title={apiError.title} message={apiError.message} type="error" />}
        <FormGroup
          element="input"
          label="Season Name"
          id="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormGroup
          element="input"
          type="date"
          label="Start Date"
          id="startDate"
          error={errors.startDate?.message}
          {...register("startDate")}
        />
        <FormGroup element="default" label="Status" id="status">
          <select id="status" className={styles.select} {...register("status")}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormGroup>
        {willAutoSetEndDate && (
          <p className={styles.hint}>
            Setting status to Completed will automatically record today as the end date.
          </p>
        )}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
