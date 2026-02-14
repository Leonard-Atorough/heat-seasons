import { Leaderboard, RacerWithStats, Season } from "shared";
import { createContext } from "react";

export interface DataContextType {
  racers: RacerWithStats[];
  leaderboard: Leaderboard | undefined;
  seasons: Season[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  refreshRacers: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshSeasons: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
