import { Racer } from "../../models";


export interface IRacerService {
  getAll(filters?: { active?: boolean }): Promise<Racer[]>;
  getById(id: string): Promise<Racer | null>;
  create(data: Omit<Racer, "id" | "joinDate">): Promise<Racer>;
  update(id: string, data: Partial<Racer>): Promise<Racer>;
  delete(id: string): Promise<void>;
  getStats(id: string): Promise<any>;
}
