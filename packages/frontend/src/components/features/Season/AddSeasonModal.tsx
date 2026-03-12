import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSeason } from "../../../services/api/season";
import { FormGroup, Modal, Button, Toast } from "../../../components/common";
import styles from "./AddSeasonModal.module.css";

const schema = z.object({
  name: z.string().trim().min(1, "Season name is required").min(2, "Season name must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required").refine((d) => !isNaN(Date.parse(d)), "Invalid date format"),
});

type FormValues = z.infer<typeof schema>;

export interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddSeasonModal({ isOpen, onClose, onSubmit }: AddSeasonModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", startDate: "" },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      await createSeason(data.name, new Date(data.startDate).toISOString());
      reset();
      onSubmit();
    } catch {
      setApiError("Failed to create season. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Season">
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {apiError && <Toast title="Error" message={apiError} type="error" />}
        <FormGroup
          element="input"
          type="text"
          label="Season Name"
          id="seasonName"
          placeholder="e.g. Winter 2026"
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
        <Button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Season"}
        </Button>
      </form>
    </Modal>
  );
}
