import { RacerEntity } from "../entities/RacerEntity";

export interface IRacerRepository {
  findAll(filters?: { active?: boolean }): Promise<RacerEntity[]>;
  findById(id: string): Promise<RacerEntity | null>;
  findByIds(ids: string[]): Promise<RacerEntity[]>;
  create(data: Omit<RacerEntity, "id" | "joinDate">): Promise<RacerEntity>;
  update(id: string, data: Partial<RacerEntity>): Promise<RacerEntity>;
  delete(id: string): Promise<void>;
}
