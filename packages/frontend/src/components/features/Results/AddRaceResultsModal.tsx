import { useState, useEffect } from "react";
import { Button, FormGroup, Modal } from "../../common";
import styles from "./AddRaceResultsModal.module.css";
import { Racer, RaceResult } from "shared/dist/index";
import { CreateRace, UpdateRace, GetRaceById } from "../../../services/api/races";

interface RaceResultFormGroupProps {
  racers: Racer[];
  selectedRacerIds: string[];
  selectedRacerId: string;
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  index: number;
  points: number;
  constructorPoints: number;
  onPointsChange: (index: number, points: number) => void;
  onConstructorPointsChange: (index: number, constructorPoints: number) => void;
  isLoading: boolean;
}

function RaceResultFormGroup({
  racers,
  selectedRacerIds,
  selectedRacerId,
  onRacerSelect,
  index,
  points,
  constructorPoints,
  onPointsChange,
  onConstructorPointsChange,
  isLoading,
}: RaceResultFormGroupProps) {
  const [currentValue, setCurrentValue] = useState(
    racers.filter((r) => r.id === selectedRacerId).map((r) => r.id)[0] || "",
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    onRacerSelect(next, currentValue || undefined);
    setCurrentValue(next);
    // Reset points for this index when racer changes
    onPointsChange(index, 0);
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
          disabled={isLoading}
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
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}
        >
          <label htmlFor={`pointsInput-${index}`} style={{ fontWeight: 500 }}>
            Points
          </label>
          <input
            id={`pointsInput-${index}`}
            type="number"
            value={points}
            onChange={(e) => onPointsChange(index, Number(e.target.value) || 0)}
            disabled={isLoading}
            style={{ width: "80px", padding: "0.5rem" }}
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}
        >
          <label htmlFor={`constructorPointsInput-${index}`} style={{ fontWeight: 500 }}>
            Constructor
          </label>
          <input
            id={`constructorPointsInput-${index}`}
            type="number"
            value={constructorPoints}
            onChange={(e) => onConstructorPointsChange(index, Number(e.target.value) || 0)}
            disabled={isLoading}
            style={{ width: "80px", padding: "0.5rem" }}
          />
        </div>
      </div>
    </div>
  );
}

export interface AddRaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId: string;
  racers: Racer[];
  selectedRacerIds: string[];
  selectedRaceId?: string;
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  onSubmit: () => void;
}

export default function AddRaceResultsModal({
  isOpen,
  onClose,
  seasonId,
  racers,
  selectedRacerIds,
  selectedRaceId,
  onRacerSelect,
  onSubmit,
}: AddRaceResultsModalProps) {
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState(new Date().toISOString().split("T")[0]);
  const [points, setPoints] = useState<number[]>(Array(racers.length).fill(0));
  const [constructorPoints, setConstructorPoints] = useState<number[]>(
    Array(racers.length).fill(0),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdateMode = Boolean(selectedRaceId);

  // Load race data when in update mode
  useEffect(() => {
    if (isUpdateMode && selectedRaceId && isOpen) {
      loadRaceData(selectedRaceId);
    } else if (!isUpdateMode && isOpen) {
      // Reset form for create mode
      setRaceName("");
      setRaceDate(new Date().toISOString().split("T")[0]);
      setPoints(Array(racers.length).fill(0));
      setConstructorPoints(Array(racers.length).fill(0));
      setError(null);
    }
  }, [isUpdateMode, selectedRaceId, isOpen, racers.length]);

  const loadRaceData = async (raceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const race = await GetRaceById(raceId);
      setRaceName(race.name);
      setRaceDate(new Date(race.date).toISOString().split("T")[0]);

      // Initialize points arrays from race results
      const newPoints = Array(racers.length).fill(0);
      const newConstructorPoints = Array(racers.length).fill(0);
      selectedRacerIds.forEach((racerId, idx) => {
        const result = race.results.find((r) => r.racerId === racerId);
        if (result) {
          newPoints[idx] = result.points;
          newConstructorPoints[idx] = result.constructorPoints;
        }
      });
      setPoints(newPoints);
      setConstructorPoints(newConstructorPoints);
    } catch (err) {
      setError("Failed to load race data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointsChange = (index: number, value: number) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleConstructorPointsChange = (index: number, value: number) => {
    const newConstructorPoints = [...constructorPoints];
    newConstructorPoints[index] = value;
    setConstructorPoints(newConstructorPoints);
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedRacerIds.length === 0) {
      setError("Please select at least one racer.");
      return;
    }

    const allSelected = racers.every((r) => selectedRacerIds.includes(r.id));
    if (!allSelected) {
      setError("Please select all racers.");
      return;
    }

    if (!raceName.trim()) {
      setError("Race name is required.");
      return;
    }

    try {
      setIsLoading(true);

      // Combine racer IDs with their points and constructorPoints
      const results = selectedRacerIds.map((racerId, idx) => ({
        racerId,
        points: points[idx],
        constructorPoints: constructorPoints[idx],
      }));

      // Sort by points descending and assign positions
      const finalResults = results
        .sort((a, b) => b.points - a.points)
        .map((r, i) => ({
          ...r,
          position: i + 1,
        })) as RaceResult[];

      if (isUpdateMode && selectedRaceId) {
        await UpdateRace(selectedRaceId, raceName, raceDate, finalResults);
      } else {
        await CreateRace(seasonId, raceName, raceDate, finalResults);
      }

      onClose();
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save race results.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdateMode ? "Update Race Results" : "Add Race Results"}
    >
      <form className={styles.raceResultForm} onSubmit={validateAndSubmit}>
        {error && (
          <div style={{ color: "red", marginBottom: "1rem", fontWeight: 500 }}>{error}</div>
        )}

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

        <FormGroup
          element="input"
          label="Race Date"
          id="raceDateInput"
          type="date"
          className={styles.raceResultForm__nameInput}
          value={raceDate}
          onChange={(e) => setRaceDate(e.target.value)}
        />

        {racers.map((_, index) => (
          <RaceResultFormGroup
            key={index}
            racers={racers}
            selectedRacerId={selectedRacerIds[index] || ""}
            selectedRacerIds={selectedRacerIds}
            onRacerSelect={onRacerSelect}
            index={index}
            points={points[index] ?? 0}
            constructorPoints={constructorPoints[index] ?? 0}
            onPointsChange={handlePointsChange}
            onConstructorPointsChange={handleConstructorPointsChange}
            isLoading={isLoading}
          />
        ))}

        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Results"}
        </Button>
      </form>
    </Modal>
  );
}
