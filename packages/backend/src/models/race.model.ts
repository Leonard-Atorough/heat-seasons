import { Race } from "@shared/index";

export interface RaceCreateInput extends Omit<Race, "id" | "createdAt" | "updatedAt"> {}

export interface RaceUpdateInput extends Partial<Omit<Race, "id" | "createdAt" | "updatedAt">> {}
