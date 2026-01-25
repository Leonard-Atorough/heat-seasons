import { SeasonStatus } from "../constants";

// Season domain models
export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: SeasonStatus;
}

export interface SeasonWithStats extends Season {
  raceCount: number;
  participantCount: number;
}

// Re-export for convenience
export type { SeasonStatus };
