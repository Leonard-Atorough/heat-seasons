import { SeasonEntity } from "../entities/SeasonEntity";
import { SeasonStatus, Season } from "shared";

export interface ISeasonRepository {
  findAll(filters?: { status?: SeasonStatus }): Promise<SeasonEntity[]>;
  findById(id: string): Promise<SeasonEntity | null>;
  findActive(): Promise<SeasonEntity | null>;
  create(data: SeasonEntity): Promise<SeasonEntity>;
  update(id: string, data: SeasonEntity): Promise<SeasonEntity>;
  delete(id: string): Promise<void>;
}
