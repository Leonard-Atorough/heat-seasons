import { useSeasons } from "../hooks/data/useSeason";
import { Button, FormGroup, LoadingSkeletonCard } from "../components/common";
import styles from "./Results.module.css";
import { Season } from "shared";
import { useEffect, useState } from "react";
import { useRaceResult } from "../hooks/data/useRaceResult";

export default function Results() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const { data: seasons } = useSeasons();
  const { races, results, racers, isLoading, error } = useRaceResult(
    selectedSeasonId || "",
    selectedRaceId || "",
  );

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [seasons, setSelectedSeasonId]);

  useEffect(() => {
    if (races && races.length > 0) {
      setSelectedRaceId("");
    }
  }, [races, setSelectedRaceId]);

  // Don't need to memoize this since it's a simple find operation and the seasons array is unlikely to be large, but we could if we wanted to optimize it further
  //   const selectedSeason = seasons?.find((season) => season.id === selectedSeasonId) || null;

  return (
    <div className="container">
      <div className={styles.resultsHeader}>
        <div className={styles.resultsHeader__selectors}>
          <FormGroup element="" label="Select Season" id="seasonSelect">
            <select
              className={styles.resultsHeader__select}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              id="seasonSelect"
              name="seasonSelect"
            >
              {seasons?.map((season: Season) => (
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
              onChange={(e) => setSelectedRaceId(e.target.value)}
              value={selectedRaceId || ""}
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
          <Button variant="primary" onClick={() => {}} type={"button"}>
            Add RaceResults
          </Button>
        </div>
      </div>
      {isLoading ? (
        <LoadingSkeletonCard />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Position</th>
              <th>Racer</th>
              <th>Team</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const racer = racers.find((r) => r.id === result.racerId);
              return (
                <tr key={result.racerId}>
                  <td>{result.position}</td>
                  <td>{racer ? racer.name : "Unknown Racer"}</td>
                  <td>{racer ? racer.team : "Unknown Team"}</td>
                  <td>{result.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
