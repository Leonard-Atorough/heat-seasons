import { Season, SeasonStatus } from "shared";

export interface SeasonCreateInput {
  name: string;
  startDate: Date;
  endDate?: Date;
}

export interface SeasonUpdateInput {
  name?: string;
  status?: SeasonStatus;
  startDate?: Date;
  endDate?: Date;
}

export type SeasonResponse = Season;
