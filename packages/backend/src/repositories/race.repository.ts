import { Race } from "../services/race.service.js";

export class RaceRepository {
  async findAll(): Promise<Race[]> {
    throw new Error("Not implemented");
  }

  async findBySeasonId(seasonId: string): Promise<Race[]> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<Race | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<Race, "id">): Promise<Race> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Race>): Promise<Race> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}

export default new RaceRepository();
