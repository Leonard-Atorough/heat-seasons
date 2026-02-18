import { RaceCreateInput, RaceResponse, RaceUpdateInput } from "src/models";
import { Race } from "shared";

export interface IRaceService {
  getBySeasonId(seasonId: string): Promise<RaceResponse[]>;
  getById(id: string): Promise<RaceResponse>;
  create(seasonId: string, data: RaceCreateInput): Promise<RaceResponse>;
  update(id: string, data: RaceUpdateInput): Promise<RaceResponse>;
  delete(id: string): Promise<void>;
  calculatePoints(position: number): Promise<number>;
}
