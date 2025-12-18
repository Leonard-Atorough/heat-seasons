import { SeasonStatus } from "shared";

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: SeasonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonCreateInput {
  name: string;
  startDate: Date;
  status?: SeasonStatus;
}

export interface SeasonUpdateInput {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  status?: SeasonStatus;
}

export interface SeasonWithStats extends Season {
  raceCount: number;
  participantCount: number;
}
