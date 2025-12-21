import { StorageAdapter } from "../../storage/";
import { Racer } from "../../models/";
import { IRacerRepository } from "./racer.repository.interface.js";

export class RacerRepository implements IRacerRepository {
  constructor(private storageAdapter: StorageAdapter) {}

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
