import { createSeason } from "../../../services/api/season";
import { FormGroup, Modal } from "../../../components/common";

export interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddSeasonModal(props: AddSeasonModalProps) {
  const { isOpen, onClose, onSubmit } = props;

  const validateAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const seasonName = formData.get("seasonName") as string;
    const startDate = new Date(formData.get("startDate") as string).toISOString();
    const endDate = formData.get("endDate") as string;

    if (!seasonName || !startDate) {
      alert("Please fill in all required fields (Season Name and Start Date).");
      return;
    }

    try {
      await createSeason(
        seasonName,
        startDate,
        endDate ? new Date(endDate).toISOString() : undefined,
      );
      onSubmit();
    } catch (err) {
      alert("Failed to create season. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Season">
      <form onSubmit={validateAndSubmit}>
        <FormGroup element="input" label="Season Name" id="seasonName" />
        <FormGroup element="input" type="date" label="Start Date" id="startDate" />
        <FormGroup element="input" type="date" label="End Date" id="endDate" />
        <button type="submit">Create Season</button>
      </form>
    </Modal>
  );
}
