import { useEffect, useState } from "react";
import { Race, RaceResult } from "shared";
import { useRacers } from "./useRacer";
import { GetRacesBySeason } from "../../services/api/races";

export function useRaceResult(seasonId: string, raceId: string) {
  const { data: racers, isLoading: racersLoading } = useRacers();
  const [races, setRaces] = useState<Race[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    setIsLoading(true);
    try {
      const fetchRaces = async () => {
        const res = await GetRacesBySeason(seasonId);
        setRaces(res);
        setIsLoading(false);
      };
      fetchRaces();
    } catch (err) {
      setError("Failed to fetch races");
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (racersLoading) return;

    if (!raceId) {
      const aggregatedResults: {
        [racerId: string]: { position: number; points: number; constructorPoints: number };
      } = {};

      races.forEach((race) => {
        race.results.forEach((result) => {
          if (!aggregatedResults[result.racerId]) {
            aggregatedResults[result.racerId] = { position: 0, points: 0, constructorPoints: 0 };
          }
          aggregatedResults[result.racerId].points += result.points;
          aggregatedResults[result.racerId].constructorPoints += result.constructorPoints;
        });

        const sortedRacers = Object.entries(aggregatedResults)
          .sort((a, b) => b[1].points - a[1].points)
          .map(
            ([racerId, data], index) =>
              ({
                racerId,
                position: index + 1,
                points: data.points,
                constructorPoints: data.constructorPoints || 0,
              }) as RaceResult,
          );
        setResults(sortedRacers);
      });
      return;
    }
    const selectedRace = races.find((race) => race.id === raceId);
    setIsLoading(true);
    try {
      if (selectedRace) {
        setResults(selectedRace.results.sort((a, b) => a.position - b.position));
      } else {
        setError("Race not found");
      }
    } catch (err) {
      setError("Failed to fetch race results");
    } finally {
      setIsLoading(false);
    }
  }, [raceId, races, racersLoading]);

  return { races, results, racers, isLoading, error };
}
