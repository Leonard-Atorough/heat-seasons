import { Season } from "@shared/index";
import { SeasonStatus } from "shared";

export interface SeasonDTO extends Season {
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonCreateInput extends Omit<Season, "id"> {}

export interface SeasonUpdateInput extends Partial<Omit<Season, "id">> {}

export type SeasonResponse = Season;
