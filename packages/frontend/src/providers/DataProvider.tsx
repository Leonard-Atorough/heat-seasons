import { ReactNode, useEffect, useState, useCallback } from "react";
import { DataContext, DataContextType } from "../contexts/DataContext";
import { Leaderboard, RacerWithStats, Season } from "@shared/models";
import { getAllRacers } from "../services/api/racer";
import { getCurrentLeaderboard } from "../services/api/leaderboard";
import { getSeasons } from "../services/api/season";

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Generic error handler for API calls
 */
const handleError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error) || "Unknown error");
};

/**
 * Generic async wrapper to handle loading and error states
 */
const createWithLoading =
  (setLoading: (loading: boolean) => void, setError: (error: Error | null) => void) =>
  async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      return await asyncFn();
    } catch (error) {
      const err = handleError(error);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

export function DataProvider({ children }: DataProviderProps) {
  const [racers, setRacers] = useState<RacerWithStats[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard>();
  const [seasons, setSeasons] = useState<Season[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Create the loading wrapper with our state setters
  const executeWithLoading = useCallback(createWithLoading(setIsLoading, setError), []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const [newRacers, newLeaderboard, newSeasons] = await Promise.all([
      executeWithLoading(() => getAllRacers()),
      executeWithLoading(() => getCurrentLeaderboard()),
      executeWithLoading(() => getSeasons()),
    ]);

    if (newRacers) setRacers(newRacers);
    if (newLeaderboard) setLeaderboard(newLeaderboard);
    if (newSeasons) setSeasons(newSeasons);
  }, [executeWithLoading]);

  // Fetch individual data sources
  const refreshRacers = useCallback(async () => {
    const data = await executeWithLoading(() => getAllRacers());
    if (data) setRacers(data);
  }, [executeWithLoading]);

  const refreshLeaderboard = useCallback(async () => {
    const data = await executeWithLoading(() => getCurrentLeaderboard());
    if (data) setLeaderboard(data);
  }, [executeWithLoading]);

  const refreshSeasons = useCallback(async () => {
    const data = await executeWithLoading(() => getSeasons());
    if (data) setSeasons(data);
  }, [executeWithLoading]);

  const value: DataContextType = {
    racers,
    leaderboard,
    seasons,
    isLoading,
    error,
    refresh: fetchAllData,
    refreshRacers,
    refreshLeaderboard,
    refreshSeasons,
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
