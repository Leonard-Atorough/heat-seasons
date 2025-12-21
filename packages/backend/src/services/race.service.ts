export interface RaceResult {
  racerId: string;
  position: number;
  points: number;
}

export interface Race {
  id: string;
  seasonId: string;
  raceNumber: number;
  date: Date;
  results: RaceResult[];
}

export class RaceService {
  async getBySeasonId(seasonId: string): Promise<Race[]> {
    throw new Error("Not implemented");
  }

  async getById(id: string): Promise<Race | null> {
    throw new Error("Not implemented");
  }

  async create(
    seasonId: string,
    data: { date: Date; results: Omit<RaceResult, "points">[] }
  ): Promise<Race> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Race>): Promise<Race> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async calculatePoints(position: number): Promise<number> {
    throw new Error("Not implemented");
  }
}

export default new RaceService();

export interface RaceServiceInterface {
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
