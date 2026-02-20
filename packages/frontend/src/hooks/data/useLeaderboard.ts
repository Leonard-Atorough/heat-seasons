import { useContext } from "react";
import { DataContext } from "../../contexts/DataContext";

export const useLeaderboard = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useLeaderboard must be used within a DataProvider");
  }
  const { leaderboard, isLoading, error, refreshLeaderboard } = context;

  return { data: leaderboard, isLoading, error, refresh: refreshLeaderboard };
};
