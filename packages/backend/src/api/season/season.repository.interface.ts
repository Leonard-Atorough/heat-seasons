import { SeasonStatus, Season } from "shared";

export interface ISeasonRepository {
  findAll(filters?: { status?: SeasonStatus }): Promise<Season[]>;
  findById(id: string): Promise<Season>;
  findActive(): Promise<Season | null>;
  create(data: Omit<Season, "id">): Promise<Season>;
  update(id: string, data: Partial<Season>): Promise<Season>;
  delete(id: string): Promise<void>;
}
