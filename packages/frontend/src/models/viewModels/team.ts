import { Racer } from "shared";

/**
 * Team view model
 * Groups racers by team for display purposes
 * This is a UI-only model with no backend equivalent
 */
export interface Team {
  name: string;
  color?: string;
  racers: Racer[];
}
