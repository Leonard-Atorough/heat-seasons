import { Racer, RacerWithStats } from "shared";
import { RacerCreateInput, RacerUpdateInput } from "src/application/dtos";
import { IRacerRepository } from "src/domain/repositories/racer.repository.interface";
import { IRacerService } from "./racer.service.interface.js";
import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { UserAggregate } from "src/domain/aggregates/userAggregate";
import { BadRequestError, NotFoundError } from "src/Infrastructure/errors/appError";
import { RacerMapper } from "src/application/mappers/racerMapper";

export class RacerService implements IRacerService {
  constructor(
    private racerRepository: IRacerRepository,
    private userRepository: IAuthRepository,
  ) {}

  async getAll(filters?: { active?: boolean }): Promise<RacerWithStats[]> {
    const racers = await this.racerRepository.findAll(filters);
    return racers.map((racer) => ({ ...RacerMapper.toResponse(racer), stats: null }));
  }

  async getById(id: string): Promise<RacerWithStats | null> {
    throw new Error("Not implemented");
  }

  async create(data: RacerCreateInput): Promise<Racer> {
    if (!data.userId) {
      throw new BadRequestError("User ID is required");
    }
    // NOTE: This approach breaks invariance but for this project is fine.
    // Refactor later to use DDD unit of work pattern or repository pattern with transactions.
    const userAggregate = await this.getUserAggregate(data.userId);

    const newRacer = RacerMapper.toDomain(data);

    userAggregate.assignRacer(newRacer);

    const savedRacer = await this.racerRepository.create(newRacer);
    await this.userRepository.update(data.userId, userAggregate.getUser());

    return RacerMapper.toResponse(savedRacer);
  }

  async update(id: string, data: RacerUpdateInput): Promise<Racer> {
    const racerToUpdate = await this.racerRepository.findById(id);
    if (!racerToUpdate) {
      throw new NotFoundError(`Racer with ID ${id} not found`);
    }

    racerToUpdate.update({ ...data });

    const updatedRacer = await this.racerRepository.update(id, racerToUpdate);
    return RacerMapper.toResponse(updatedRacer);
  }

  async delete(id: string): Promise<void> {
    const racerToDelete = await this.racerRepository.findById(id);
    if (!racerToDelete) {
      throw new NotFoundError(`Racer with ID ${id} not found`);
    }
    await this.racerRepository.delete(id);
  }

  async getStats(id: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async getUserAggregate(userId: string): Promise<UserAggregate> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const racer = await this.racerRepository.findById(userId);
    return new UserAggregate(user, racer);
  }
}
