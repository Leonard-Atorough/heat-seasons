import { SeasonStatus, SeasonParticipant } from "shared";
import { SeasonCreateInput, SeasonResponse, SeasonUpdateInput } from "../../application/dtos/index.js";

export interface ISeasonService {
  getAll(filters?: { status?: SeasonStatus }): Promise<SeasonResponse[]>;
  getById(id: string): Promise<SeasonResponse>;
  create(data: SeasonCreateInput): Promise<SeasonResponse>;
  joinSeason(seasonId: string, racerId: string): Promise<SeasonParticipant>;
  getParticipants(seasonId: string): Promise<SeasonParticipant[]>;
  update(id: string, data: SeasonUpdateInput): Promise<SeasonResponse>;
  delete(id: string): Promise<void>;
}
