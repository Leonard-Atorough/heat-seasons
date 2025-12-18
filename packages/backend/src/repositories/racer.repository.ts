import { Racer } from "../services/racer.service.js";

export class RacerRepository {
  async findAll(filters?: { active?: boolean }): Promise<Racer[]> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<Racer | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<Racer, "id" | "joinDate">): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Racer>): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}

export default new RacerRepository();
