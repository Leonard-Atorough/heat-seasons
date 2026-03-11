import { SeasonStatus } from "../constants.js";

// Season domain models
export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startDate: Date;
  endDate?: Date;
}

export interface SeasonParticipant {
  seasonId: string;
  racerId: string;
  registeredAt: Date;
}

// Re-export for convenience
export type { SeasonStatus };
