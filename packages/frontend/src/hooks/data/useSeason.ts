import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts/DataContext";

export const useSeasons = () => {
  const { seasons, isLoading, error, refreshSeasons } = useContext(DataContext) as DataContextType;
  return { data: seasons, isLoading, error, refresh: refreshSeasons };
};

export const useSeason = () => {
  const { seasons, isLoading, error, refreshSeasons } = useContext(DataContext) as DataContextType;
  const activeSeason = seasons ? seasons.find((season) => season.status === "active") : null;
  return { data: activeSeason, isLoading, error, refresh: refreshSeasons };
};
