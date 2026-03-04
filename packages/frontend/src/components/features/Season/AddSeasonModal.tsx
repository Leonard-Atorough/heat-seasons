import { FormGroup, Modal } from "../../../components/common";

export interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddSeasonModal(props: AddSeasonModalProps) {
  const { isOpen, onClose, onSubmit } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Season">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <FormGroup element="input" label="Season Name" id="seasonName" />
        <FormGroup element="input" type="date" label="Start Date" id="startDate" />
        <FormGroup element="input" type="date" label="End Date" id="endDate" />
        <button type="submit">Create Season</button>
      </form>
    </Modal>
  );
}
