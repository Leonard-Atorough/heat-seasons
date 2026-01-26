import { Season, SeasonStatus } from "@shared/models";
import { SeasonCreateInput, SeasonUpdateInput } from "src/models";

export interface ISeasonService {
  getAll(filters?: { status?: SeasonStatus }): Promise<Season[]>;
  getById(id: string): Promise<Season>;
  create(data: SeasonCreateInput): Promise<Season>;
  update(id: string, data: SeasonUpdateInput): Promise<Season>;
  delete(id: string): Promise<void>;
  getActiveSeason(): Promise<Season>;
}
