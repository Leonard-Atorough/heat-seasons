import { createSeason } from "../../../services/api/season";
import { FormGroup, Modal, Button, Toast } from "../../../components/common";
import styles from "./AddSeasonModal.module.css";
import { useState } from "react";

export interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddSeasonModal({ isOpen, onClose, onSubmit }: AddSeasonModalProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const seasonName = formData.get("seasonName") as string;
    const startDateRaw = formData.get("startDate") as string;

    if (!seasonName || !startDateRaw) {
      setErrors(["Please fill in all required fields (Season Name and Start Date)."]);
      return;
    }

    const startDate = new Date(startDateRaw).toISOString();

    try {
      await createSeason(seasonName, startDate);
      onSubmit();
      setErrors([]);
    } catch (err) {
      setErrors(["Failed to create season. Please try again."]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Season">
      <form onSubmit={validateAndSubmit} className={styles.form}>
        {errors.length > 0 && <Toast message={errors.join("\n")} type="error" />}
        <FormGroup
          element="input"
          type="text"
          label="Season Name"
          id="seasonName"
          placeholder="e.g. Winter 2026"
        />
        <FormGroup
          element="input"
          type="date"
          label="Start Date"
          id="startDate"
          placeholder="YYYY-MM-DD"
        />
        <Button type="submit" className={styles.button}>
          Create Season
        </Button>
      </form>
    </Modal>
  );
}
