import { Racer, RacerWithStats } from "@shared/index";

export interface RacerDTO extends Racer {
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}

export interface RacerCreateInput extends Omit<Racer, "id" | "joinDate"> {}

export interface RacerUpdateInput extends Partial<Omit<Racer, "id" | "joinDate">> {}

export type RacerResponse = RacerWithStats;
