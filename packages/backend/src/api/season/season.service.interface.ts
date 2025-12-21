import { Season } from "./season.service.js";
import { SeasonStatus } from "shared";

export interface ISeasonService {
  getAll(filters?: { status?: SeasonStatus }): Promise<Season[]>;
  getById(id: string): Promise<Season | null>;
  create(data: Omit<Season, "id">): Promise<Season>;
  update(id: string, data: Partial<Season>): Promise<Season>;
  delete(id: string): Promise<void>;
  getActiveSeason(): Promise<Season | null>;
}
