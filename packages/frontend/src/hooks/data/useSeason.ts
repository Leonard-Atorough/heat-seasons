import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts/DataContext";

export const useSeasons = () => {
  const { season, isLoading, error, refreshSeason } = useContext(DataContext) as DataContextType;
  return { data: season, isLoading, error, refresh: refreshSeason };
}