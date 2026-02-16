import { SeasonStatus } from "shared";
import { SeasonCreateInput, SeasonResponse, SeasonUpdateInput } from "src/models";

export interface ISeasonService {
  getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]>;
  getById(id: string): Promise<SeasonResponse>;
  create(data: SeasonCreateInput): Promise<SeasonResponse>;
  update(id: string, data: SeasonUpdateInput): Promise<SeasonResponse>;
  delete(id: string): Promise<void>;
  getActiveSeason(): Promise<SeasonResponse>;
}
