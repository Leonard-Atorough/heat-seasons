import { Racer } from "@shared/index";

export interface IRacerRepository {
  findAll(filters?: { active?: boolean }): Promise<Racer[]>;
  findById(id: string): Promise<Racer | null>;
  findByIds(ids: string[]): Promise<Racer[]>;
  create(data: Omit<Racer, "id" | "joinDate">): Promise<Racer>;
  update(id: string, data: Partial<Racer>): Promise<Racer>;
  delete(id: string): Promise<void>;
}
