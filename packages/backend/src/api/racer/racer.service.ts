import { Racer, RacerWithStats } from "@shared/index";
import { RacerCreateInput, RacerUpdateInput } from "../../models/";
import { IRacerRepository } from "./racer.repository.interface.js";
import { IRacerService } from "./racer.service.interface.js";

export class RacerService implements IRacerService {
  constructor(private racerRepository: IRacerRepository) {}

  async getAll(filters?: { active?: boolean }): Promise<RacerWithStats[]> {
    const racers = await this.racerRepository.findAll(filters);
    return racers.map((racer) => ({ ...racer, stats: null }));
  }

  async getById(id: string): Promise<RacerWithStats | null> {
    throw new Error("Not implemented");
  }

  async create(data: RacerCreateInput): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: RacerUpdateInput): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getStats(id: string): Promise<any> {
    throw new Error("Not implemented");
  }
}
