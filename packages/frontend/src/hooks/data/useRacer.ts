import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts";

export const useRacers = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useRacers must be used within a DataProvider");
  }
  const { racers, isRacersLoading, error, refreshRacers } = context as DataContextType;
  return { data: racers, isLoading: isRacersLoading, error, refresh: refreshRacers };
};
