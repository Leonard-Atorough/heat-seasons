import { Race, Season } from "shared";
import { Button, FormGroup } from "../../common";
import styles from "./ResultsHeader.module.css";
import { useAuth } from "../../../hooks/useAuth";
import { useCallback } from "react";

export interface ResultsHeaderProps {
  seasons: Season[];
  races: Race[];
  selectedRaceId: string | null;
  onSeasonChange: (seasonId: string) => void;
  onRaceChange: (raceId: string) => void;
  onAddResults: () => void;
  onUpdateResults?: () => void;
}

export default function ResultsHeader({
  seasons,
  races,
  selectedRaceId,
  onSeasonChange,
  onRaceChange,
  onAddResults,
  onUpdateResults,
}: ResultsHeaderProps) {
  const { user } = useAuth();
  const showUpdateButton = useCallback(() => {
    if (!user || user.role !== "admin") return false;
    if (!onUpdateResults) return false;
    if (!selectedRaceId) return false;
    return true;
  }, [user, onUpdateResults, selectedRaceId]);

  return (
    <div className={styles.resultsHeader}>
      <div className={styles.resultsHeader__selectors}>
        <FormGroup element="" label="Select Season" id="seasonSelect">
          <select
            className={styles.resultsHeader__select}
            onChange={(e) => onSeasonChange(e.target.value)}
            id="seasonSelect"
            name="seasonSelect"
          >
            {seasons.map((season: Season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </FormGroup>
        <FormGroup element="" label="Select Race" id="raceSelect">
          <select
            id="raceSelect"
            name="raceSelect"
            className={styles.resultsHeader__select}
            onChange={(e) => onRaceChange(e.target.value)}
            value={selectedRaceId ?? ""}
          >
            <option value="">All</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
        </FormGroup>
      </div>
      <div className={styles.resultsHeader__actions}>
        {user && user.role === "admin" && (
          <Button variant="primary" onClick={onAddResults} type="button" className={styles.resultsHeader__addButton}>
            Add RaceResults
          </Button>
        )}
        {showUpdateButton() && (
          <Button variant="secondary" onClick={onUpdateResults} type="button" className={styles.resultsHeader__updateButton}>
            Update RaceResults
          </Button>
        )}
      </div>
    </div>
  );
}
