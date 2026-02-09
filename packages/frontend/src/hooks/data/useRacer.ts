import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts/DataContext";

export const useRacers = () => {
  const { racers, isLoading, error, refreshRacers } = useContext(DataContext) as DataContextType;
  return { data: racers, isLoading, error, refresh: refreshRacers };
};
