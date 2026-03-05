import { createSeason } from "../../../services/api/season";
import { FormGroup, Modal, Button } from "../../../components/common";

export interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddSeasonModal({ isOpen, onClose, onSubmit }: AddSeasonModalProps) {
  const validateAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const seasonName = formData.get("seasonName") as string;
    const startDate = new Date(formData.get("startDate") as string).toISOString();

    if (!seasonName || !startDate) {
      alert("Please fill in all required fields (Season Name and Start Date).");
      return;
    }

    try {
      await createSeason(seasonName, startDate);
      onSubmit();
    } catch (err) {
      alert("Failed to create season. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Season">
      <form onSubmit={validateAndSubmit}>
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
        <Button type="submit">Create Season</Button>
      </form>
    </Modal>
  );
}
