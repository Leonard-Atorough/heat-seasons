import { Racer, RacerWithStats } from "shared";
import { RacerCreateInput, RacerUpdateInput } from "src/application/dtos";

export interface IRacerService {
  getAll(filters?: { active?: boolean }): Promise<RacerWithStats[]>;
  getById(id: string): Promise<RacerWithStats | null>;
  create(data: RacerCreateInput): Promise<Racer>;
  update(id: string, data: RacerUpdateInput): Promise<Racer>;
  delete(id: string): Promise<void>;
  getStats(id: string): Promise<any>;
}
