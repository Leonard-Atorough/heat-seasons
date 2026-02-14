import { Race } from "shared";

export interface RaceCreateInput extends Omit<Race, "id" | "createdAt" | "updatedAt"> {}

export interface RaceUpdateInput extends Partial<Omit<Race, "id" | "createdAt" | "updatedAt">> {}
