import { useState } from "react";
import { FormGroup, Modal } from "../../common";
import styles from "./AddRaceResultsModal.module.css";
import { Racer } from "shared/dist/index";

interface RaceResultFormGroupProps {
  racers: Racer[];
  selectedRacerIds: string[];
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
}

function RaceResultFormGroup({
  racers,
  selectedRacerIds,
  onRacerSelect,
}: RaceResultFormGroupProps) {
  const [currentValue, setCurrentValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    onRacerSelect(next, currentValue || undefined);
    setCurrentValue(next);
  };

  return (
    <div className={styles.raceResultForm__group}>
      <FormGroup element="select" label="Racer" id="racerSelect">
        <select
          id="racerSelect"
          name="racerSelect"
          className={styles.raceResultForm__select}
          onChange={handleChange}
        >
          <option value="">Select a racer</option>
          {racers.map((racer) => (
            <option key={racer.id} value={racer.id} disabled={selectedRacerIds.includes(racer.id)}>
              {racer.name} ({racer.team})
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup
        element="input"
        label="Points"
        id="pointsInput"
        type="number"
        className={styles.raceResultForm__input}
      />
    </div>
  );
}

export interface AddRaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  racers: Racer[];
  selectedRacerIds: string[];
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
}

export default function AddRaceResultsModal({
  isOpen,
  onClose,
  racers,
  selectedRacerIds,
  onRacerSelect,
}: AddRaceResultsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Race Results">
      <form className={styles.raceResultForm}>
        {racers.map((_, index) => (
          <RaceResultFormGroup
            key={index}
            racers={racers}
            selectedRacerIds={selectedRacerIds}
            onRacerSelect={onRacerSelect}
          />
        ))}
      </form>
    </Modal>
  );
}
