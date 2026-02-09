import { Leaderboard, RacerWithStats, Season } from "@shared/index";
import { createContext } from "react";

export interface DataContextType {
  racers: RacerWithStats[];
  leaderboard: Leaderboard | undefined;
  season: Season | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  refreshRacers: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshSeason: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
