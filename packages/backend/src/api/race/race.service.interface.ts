import { Race, RaceResult } from "./race.service.js";

export interface IRaceService {
  getBySeasonId(seasonId: string): Promise<Race[]>;
  getById(id: string): Promise<Race | null>;
  create(
    seasonId: string,
    data: { date: Date; results: Omit<RaceResult, "points">[] }
  ): Promise<Race>;
  update(id: string, data: Partial<Race>): Promise<Race>;
  delete(id: string): Promise<void>;
  calculatePoints(position: number): Promise<number>;
}
