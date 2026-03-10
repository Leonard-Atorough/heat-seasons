import { Racer, RacerWithStats } from "shared";
import { RacerCreateInput, RacerUpdateInput } from "src/application/dtos";
import { IRacerRepository } from "src/domain/repositories/racer.repository.interface";
import { IRacerService } from "./racer.service.interface.js";
import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { UserAggregate } from "src/domain/aggregates/userAggregate";
import { BadRequestError, NotFoundError } from "src/Infrastructure/errors/appError";
import { RacerMapper } from "src/application/mappers";

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
    const racer = await this.racerRepository.findById(id);
    if (!racer) return null;
    return { ...RacerMapper.toResponse(racer), stats: null };
  }

  async getByUserId(userId: string): Promise<RacerWithStats | null> {
    const racer = await this.racerRepository.findByUserId(userId);
    if (!racer) return null;
    return { ...RacerMapper.toResponse(racer), stats: null };
  }

  async create(data: RacerCreateInput): Promise<Racer> {
    if (!data.userId) {
      const savedRacer = await this.racerRepository.create(RacerMapper.toDomain(data));
      return RacerMapper.toResponse(savedRacer);
      // If no userId is provided, we create the racer without linking to a user.
    }

    // NOTE: This approach breaks invariance but for this project is fine.
    // Refactor later to use DDD unit of work pattern or repository pattern with transactions.
    const userAggregate = await this.getUserAggregate(data.userId);

    const newRacer = RacerMapper.toDomain(data);

    // Create the racer first so the repository assigns its ID, then link it
    // to the user. Previously assignRacer was called before create(), meaning
    // user.racerId was set to undefined and the user update was a no-op.
    const savedRacer = await this.racerRepository.create(newRacer);
    userAggregate.assignRacer(savedRacer);
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
