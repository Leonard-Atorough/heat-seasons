import { Racer, RacerWithStats } from "@shared/index";
import { RacerCreateInput, RacerUpdateInput } from "../../models";

export interface IRacerService {
  getAll(filters?: { active?: boolean }): Promise<RacerWithStats[]>;
  getById(id: string): Promise<RacerWithStats | null>;
  create(data: RacerCreateInput): Promise<Racer>;
  update(id: string, data: RacerUpdateInput): Promise<Racer>;
  delete(id: string): Promise<void>;
  getStats(id: string): Promise<any>;
}
