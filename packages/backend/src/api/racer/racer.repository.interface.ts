import { RacerDTO } from "src/models";

export interface IRacerRepository {
  findAll(filters?: { active?: boolean }): Promise<RacerDTO[]>;
  findById(id: string): Promise<RacerDTO | null>;
  create(data: Omit<RacerDTO, "id" | "joinDate">): Promise<RacerDTO>;
  update(id: string, data: Partial<RacerDTO>): Promise<RacerDTO>;
  delete(id: string): Promise<void>;
}
