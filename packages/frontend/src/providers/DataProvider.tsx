import { ReactNode, useEffect, useState, useCallback, useMemo } from "react";
import { DataContext, DataContextType } from "../contexts";
import { RacerWithStats, Season } from "shared";
import { getAllRacers } from "../services/api/racer";
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
  const [seasons, setSeasons] = useState<Season[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Create the loading wrapper with our state setters
  const executeWithLoading = useCallback(createWithLoading(setIsLoading, setError), []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const [newRacers, newSeasons] = await Promise.all([
      executeWithLoading(() => getAllRacers()),
      executeWithLoading(() => getSeasons()),
    ]);

    if (newRacers) setRacers(newRacers);
    if (newSeasons) setSeasons(newSeasons);
  }, [executeWithLoading]);

  // Fetch individual data sources
  const refreshRacers = useCallback(async () => {
    const data = await executeWithLoading(() => getAllRacers());
    if (data) setRacers(data);
  }, [executeWithLoading]);

  const refreshSeasons = useCallback(async () => {
    const data = await executeWithLoading(() => getSeasons());
    if (data) setSeasons(data);
  }, [executeWithLoading]);

  const value: DataContextType = useMemo(
    () => ({
      racers,
      seasons,
      isLoading,
      error,
      refresh: fetchAllData,
      refreshRacers,
      refreshSeasons,
    }),
    [racers, seasons, isLoading, error, fetchAllData, refreshRacers, refreshSeasons],
  );

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
