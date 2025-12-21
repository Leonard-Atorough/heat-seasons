import { Racer } from "../../models/";
import { IRacerRepository } from "./racer.repository.interface.js";
import { IRacerService } from "./racer.service.interface.js";

export class RacerService implements IRacerService {
  constructor(private racerRepository: IRacerRepository) {}

  async getAll(filters?: { active?: boolean }): Promise<Racer[]> {
    throw new Error("Not implemented");
  }

  async getById(id: string): Promise<Racer | null> {
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

  async getStats(id: string): Promise<any> {
    throw new Error("Not implemented");
  }
}
