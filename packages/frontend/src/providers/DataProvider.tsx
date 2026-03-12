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
  const [isRacersLoading, setIsRacersLoading] = useState<boolean>(false);
  const [isSeasonsLoading, setIsSeasonsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Concrete loading wrappers — state setters from useState are stable references
  const withRacersLoading = useCallback(createWithLoading(setIsRacersLoading, setError), []);
  const withSeasonsLoading = useCallback(createWithLoading(setIsSeasonsLoading, setError), []);

  const refresh = useCallback(async () => {
    const [newRacers, newSeasons] = await Promise.all([
      withRacersLoading(() => getAllRacers()),
      withSeasonsLoading(() => getSeasons()),
    ]);

    if (newRacers) setRacers(newRacers);
    if (newSeasons) setSeasons(newSeasons);
  }, [withRacersLoading, withSeasonsLoading]);

  const refreshRacers = useCallback(async () => {
    const data = await withRacersLoading(() => getAllRacers());
    if (data) setRacers(data);
  }, [withRacersLoading]);

  const refreshSeasons = useCallback(async () => {
    const data = await withSeasonsLoading(() => getSeasons());
    if (data) setSeasons(data);
  }, [withSeasonsLoading]);

  const value: DataContextType = useMemo(
    () => ({
      racers,
      seasons,
      isRacersLoading,
      isSeasonsLoading,
      error,
      refresh,
      refreshRacers,
      refreshSeasons,
    }),
    [
      racers,
      seasons,
      isRacersLoading,
      isSeasonsLoading,
      error,
      refresh,
      refreshRacers,
      refreshSeasons,
    ],
  );

  // Fetch all data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // fetch all data on focus change (e.g. when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        refresh();
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return () => clearInterval(interval);
  }, [refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
