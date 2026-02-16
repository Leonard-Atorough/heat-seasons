import { SeasonStatus } from "../constants";

// Season domain models
export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: Date;
  endDate?: Date;
  totalRaces: number;
  racesCompleted: number;
  totalParticipants: number;
}

// Re-export for convenience
export type { SeasonStatus };
