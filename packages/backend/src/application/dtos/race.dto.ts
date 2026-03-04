import { Race } from "shared";

// completed is not provided on creation — defaults to false
export interface RaceCreateInput extends Omit<Race, "id" | "completed"> {}

export interface RaceUpdateInput extends Partial<Omit<Race, "id" | "date">> {}

export interface RaceResponse extends Race {}
