import { SeasonRequest } from "../../../models";
import { Season, type SeasonStatus } from "shared";

export const createSeasonRequest = (): SeasonRequest => ({
  name: "Summer 2024",
  startDate: "2024-06-01",
});

export const createSeason = (partial?: Partial<Season>): Season => ({
  id: "season-1",
  name: "Summer 2024",
  status: "upcoming" as SeasonStatus,
  startDate: new Date("2024-06-01"),
  endDate: undefined,
  ...partial,
});
