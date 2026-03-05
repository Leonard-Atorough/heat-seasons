import { RacerWithStats, Season } from "shared";
import { createContext } from "react";

export interface DataContextType {
  racers: RacerWithStats[];
  seasons: Season[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  refreshRacers: () => Promise<void>;
  refreshSeasons: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
