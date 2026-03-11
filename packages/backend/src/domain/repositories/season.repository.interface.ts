import { SeasonEntity } from "../entities/index.js";
import { SeasonStatus, SeasonParticipant } from "shared";

export interface ISeasonRepository {
  findAll(filters?: { status?: SeasonStatus }): Promise<SeasonEntity[]>;
  findById(id: string): Promise<SeasonEntity | null>;
  findActive(): Promise<SeasonEntity | null>;
  create(data: SeasonEntity): Promise<SeasonEntity>;
  update(id: string, data: SeasonEntity): Promise<SeasonEntity>;
  delete(id: string): Promise<void>;
  addParticipant(seasonId: string, racerId: string): Promise<SeasonParticipant>;
  removeParticipant(seasonId: string, racerId: string): Promise<void>;
  findParticipants(seasonId: string): Promise<SeasonParticipant[]>;
}
