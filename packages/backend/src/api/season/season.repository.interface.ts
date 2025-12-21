import { Season } from "./season.service.js";
import { SeasonStatus } from "shared";

export interface ISeasonRepository {
  findAll(filters?: { status?: SeasonStatus }): Promise<Season[]>;
  findById(id: string): Promise<Season | null>;
  findActive(): Promise<Season | null>;
  create(data: Omit<Season, "id">): Promise<Season>;
  update(id: string, data: Partial<Season>): Promise<Season>;
  delete(id: string): Promise<void>;
}
