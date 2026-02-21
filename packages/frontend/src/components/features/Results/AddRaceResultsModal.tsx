import { useState } from "react";
import { Button, FormGroup, Modal } from "../../common";
import styles from "./AddRaceResultsModal.module.css";
import { Racer, RaceResult } from "shared/dist/index";
import { CreateRace } from "../../../services/api/races";

interface RaceResultFormGroupProps {
  racers: Racer[];
  selectedRacerIds: string[];
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  index: number;
}

function RaceResultFormGroup({
  racers,
  selectedRacerIds,
  onRacerSelect,
  index,
}: RaceResultFormGroupProps) {
  const [currentValue, setCurrentValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    console.log(`Select ${index} changed to:`, next);
    onRacerSelect(next, currentValue || undefined);
    setCurrentValue(next);
  };

  return (
    <div className={styles.raceResultForm__group}>
      <FormGroup element="select" label="Racer" id={`racerSelect-${index}`}>
        <select
          id={`racerSelect-${index}`}
          name={`racerSelect-${index}`}
          className={styles.raceResultForm__select}
          value={currentValue}
          onChange={handleChange}
        >
          <option value="">Select a racer</option>
          {racers.map((racer) => (
            <option
              key={racer.id}
              value={racer.id}
              disabled={selectedRacerIds.includes(racer.id) && racer.id !== currentValue}
            >
              {racer.name} ({racer.team})
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup
        element="input"
        label="Points"
        id={`pointsInput-${index}`}
        name={`pointsInput-${index}`}
        type="number"
        className={styles.raceResultForm__input}
      />
    </div>
  );
}

export interface AddRaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId: string;
  racers: Racer[];
  selectedRacerIds: string[];
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  onSubmit: () => void;
}

export default function AddRaceResultsModal({
  isOpen,
  onClose,
  seasonId,
  racers,
  selectedRacerIds,
  onRacerSelect,
  onSubmit,
}: AddRaceResultsModalProps) {
  const [raceName, setRaceName] = useState("");

  const ValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRacerIds.length === 0) {
      alert("Please select at least one racer.");
      return;
    }

    const allSelected = racers.every((r) => selectedRacerIds.includes(r.id));
    if (!allSelected) {
      alert("Please select all racers.");
      return;
    }
    console.log(
      "Submitting race results with seasonId:",
      seasonId,
      "raceName:",
      raceName,
      "selectedRacerIds:",
      selectedRacerIds,
    );

    const data = new FormData(e.target as HTMLFormElement);
    const entries = Array.from(data.entries());

    // Extract both racer selections and points by index
    const racerSelectEntries = entries
      .filter(([key]) => key.startsWith("racerSelect-"))
      .map(([key, value]) => {
        const index = key.split("-")[1];
        return { index, racerId: value as string };
      });

    const pointsInputEntries = entries
      .filter(([key]) => key.startsWith("pointsInput-"))
      .map(([key, value]) => {
        const index = key.split("-")[1];
        return { index, points: Number(value) };
      });

    // Combine by matching indices
    const results = racerSelectEntries.map(({ index, racerId }) => {
      const pointsEntry = pointsInputEntries.find((p) => p.index === index);
      return { racerId, points: pointsEntry ? pointsEntry.points : 0 };
    });

    const finalResults = results
      .sort((a, b) => a.points - b.points)
      .map((r, i) => ({
        ...r,
        position: i + 1,
      })) as RaceResult[];

    console.log("Extracted results from form:", results);
    console.log("Final results to send:", finalResults);
    console.log("Racer select entries:", racerSelectEntries);
    console.log("Points input entries:", pointsInputEntries);

    const result = await CreateRace(seasonId, raceName, new Date().toISOString(), finalResults);

    console.log("CreateRace result:", result);
    onClose();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Race Results">
      <form className={styles.raceResultForm} onSubmit={ValidateAndSubmit}>
        <FormGroup
          element="input"
          label="Race Name"
          id="raceNameInput"
          type="text"
          className={styles.raceResultForm__nameInput}
          placeholder="Enter race name"
          value={raceName}
          onChange={(e) => setRaceName(e.target.value)}
        />
        {racers.map((_, index) => (
          <RaceResultFormGroup
            key={index}
            racers={racers}
            selectedRacerIds={selectedRacerIds}
            onRacerSelect={onRacerSelect}
            index={index}
          />
        ))}
        <Button variant="primary" type="submit">
          Save Results
        </Button>
      </form>
    </Modal>
  );
}
