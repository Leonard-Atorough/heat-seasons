import { Racer } from "@shared/index";

// Input types for racer operations
export type RacerCreateInput = Omit<Racer, "id" | "joinDate">;

export type RacerUpdateInput = Partial<Omit<Racer, "id" | "joinDate">>;
