import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts";

export const useSeasons = () => {
  const { seasons, isSeasonsLoading, error, refreshSeasons } = useContext(DataContext) as DataContextType;
  return { data: seasons, isLoading: isSeasonsLoading, error, refresh: refreshSeasons };
};

export const useActiveSeason = () => {
  const { seasons, isSeasonsLoading, error, refreshSeasons } = useContext(DataContext) as DataContextType;
  const activeSeason = seasons ? seasons.find((season) => season.status === "active") : null;
  return { data: activeSeason, isLoading: isSeasonsLoading, error, refresh: refreshSeasons };
};
