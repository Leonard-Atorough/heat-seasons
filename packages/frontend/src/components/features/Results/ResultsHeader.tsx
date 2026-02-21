import { Race, Season } from "shared";
import { Button, FormGroup } from "../../common";
import styles from "./ResultsHeader.module.css";

export interface ResultsHeaderProps {
  seasons: Season[];
  races: Race[];
  selectedRaceId: string | null;
  onSeasonChange: (seasonId: string) => void;
  onRaceChange: (raceId: string) => void;
  onAddResults: () => void;
}

export default function ResultsHeader({
  seasons,
  races,
  selectedRaceId,
  onSeasonChange,
  onRaceChange,
  onAddResults,
}: ResultsHeaderProps) {
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
        <Button variant="primary" onClick={onAddResults} type="button">
          Add RaceResults
        </Button>
      </div>
    </div>
  );
}
