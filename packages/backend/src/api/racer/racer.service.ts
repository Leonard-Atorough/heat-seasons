import { Racer, RacerWithStats } from "shared";
import { RacerCreateInput, RacerUpdateInput } from "../../models/";
import { IRacerRepository } from "./racer.repository.interface.js";
import { IRacerService } from "./racer.service.interface.js";
import { IAuthRepository } from "../auth/auth.repository.interface.js";
import { UserAggregate } from "src/domain/aggregates/userAggregate";
import { BadRequestError, NotFoundError } from "src/errors/appError";
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
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
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
