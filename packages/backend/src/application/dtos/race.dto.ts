import { Race } from "shared";

export interface RaceCreateInput extends Omit<Race, "id" | "createdAt" | "updatedAt"> {}

// Q. This should have an id, shouldn't it since its an update input?
export interface RaceUpdateInput extends Partial<Omit<Race, "id" | "date" | "createdAt" | "updatedAt">> {}

export interface RaceResponse extends Race {}
