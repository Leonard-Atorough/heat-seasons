import { Season } from "@shared/index";

export interface SeasonCreateInput extends Omit<Season, "id"> {}

export interface SeasonUpdateInput extends Partial<Omit<Season, "id">> {}

export type SeasonResponse = Season;
