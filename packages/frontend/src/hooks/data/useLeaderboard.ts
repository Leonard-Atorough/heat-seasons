import { useContext } from "react";
import { DataContext, DataContextType } from "../../contexts/DataContext";

export const useLeaderboard = () => {
  const { leaderboard, isLoading, error, refreshLeaderboard } = useContext(
    DataContext,
  ) as DataContextType;
  return { data: leaderboard, isLoading, error, refresh: refreshLeaderboard };
};
