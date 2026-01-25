import { Race } from "@shared/index";

export interface IRaceRepository {
  findAll(): Promise<Race[]>;
  findBySeasonId(seasonId: string): Promise<Race[]>;
  findById(id: string): Promise<Race | null>;
  create(data: Omit<Race, "id">): Promise<Race>;
  update(id: string, data: Partial<Race>): Promise<Race>;
  delete(id: string): Promise<void>;
}
