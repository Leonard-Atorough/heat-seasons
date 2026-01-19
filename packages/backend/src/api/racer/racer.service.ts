import { RacerCreateInput, RacerDTO, RacerResponse, RacerUpdateInput } from "../../models/";
import { IRacerRepository } from "./racer.repository.interface.js";
import { IRacerService } from "./racer.service.interface.js";

export class RacerService implements IRacerService {
  constructor(private racerRepository: IRacerRepository) {}

  async getAll(filters?: { active?: boolean }): Promise<RacerResponse[]> {
    const racers = await this.racerRepository.findAll(filters);
    return this.mapDTOToRacer(racers);
  }

  async getById(id: string): Promise<RacerResponse | null> {
    throw new Error("Not implemented");
  }

  async create(data: RacerCreateInput): Promise<RacerResponse> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: RacerUpdateInput): Promise<RacerResponse> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getStats(id: string): Promise<any> {
    throw new Error("Not implemented");
  }

  private mapDTOToRacer(dtos: RacerDTO[]): RacerResponse[] {
    return dtos.map((dto) => ({
      id: dto.id,
      name: dto.name,
      active: dto.active,
      joinDate: dto.joinDate,
      team: dto.team,
      teamColor: dto.teamColor,
      nationality: dto.nationality,
      age: dto.age,
      stats: null,
    }));
  }
}
