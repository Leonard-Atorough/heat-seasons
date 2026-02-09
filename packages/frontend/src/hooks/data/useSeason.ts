import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts/DataContext";

export const useSeasons = () => {
  const { seasons, isLoading, error, refreshSeasons } = useContext(DataContext) as DataContextType;
  return { data: seasons, isLoading, error, refresh: refreshSeasons };
};
