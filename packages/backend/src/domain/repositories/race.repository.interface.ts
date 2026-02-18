import { RaceEntity } from "../entities/RaceEntity";

export interface IRaceRepository {
  findAll(): Promise<RaceEntity[]>;
  findBySeasonId(seasonId: string): Promise<RaceEntity[]>;
  findById(id: string): Promise<RaceEntity | null>;
  create(data: RaceEntity): Promise<RaceEntity>;
  update(id: string, data: RaceEntity): Promise<RaceEntity>;
  delete(id: string): Promise<void>;
}
