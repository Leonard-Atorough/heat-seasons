import { useContext } from "react";
import { DataContext } from "../../contexts";

export const useRacers = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useRacers must be used within a DataProvider");
  }
  const { racers, isLoading, error, refreshRacers } = context;
  return { data: racers, isLoading, error, refresh: refreshRacers };
};
