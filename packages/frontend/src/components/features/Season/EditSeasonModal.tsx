import { useState } from "react";
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

export interface EditSeasonModalProps {
  season: Season;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function EditSeasonModal({ season, isOpen, onClose, onSubmit }: EditSeasonModalProps) {
  const [name, setName] = useState(season.name);
  const [startDate, setStartDate] = useState(
    new Date(season.startDate).toISOString().split("T")[0],
  );
  const [status, setStatus] = useState<SeasonStatus>(season.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await updateSeason(season.id, {
        name,
        startDate: new Date(startDate).toISOString(),
        status,
      });
      onSubmit();
    } catch (err) {
      setError("Failed to update season. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const willAutoSetEndDate = (status === "completed" || status === "archived") && !season.endDate;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Season">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <Toast message={error} type="error" />}
        <FormGroup
          element="input"
          label="Season Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormGroup
          element="input"
          type="date"
          label="Start Date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <FormGroup element="default" label="Status" id="status">
          <select
            id="status"
            name="status"
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as SeasonStatus)}
          >
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
