import { Racer, RacerWithStats } from "shared";
import { RacerCreateInput, RacerUpdateInput } from "src/application/dtos";
import { IRacerRepository } from "src/domain/repositories/racer.repository.interface";
import { IRacerService } from "./racer.service.interface.js";
import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { UserAggregate } from "src/domain/aggregates/userAggregate";
import { RacerMapper } from "src/application/mappers";
import { NotFoundError, NotImplemented } from "src/domain/errors";
import { mapWriteFailure } from "src/api/serviceWriteFailure";

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
      try {
        const savedRacer = await this.racerRepository.create(RacerMapper.toDomain(data));
        return RacerMapper.toResponse(savedRacer);
      } catch (error) {
        throw mapWriteFailure("Failed to create racer", { operation: "createRacer" }, error);
      }
      // If no userId is provided, we create the racer without linking to a user.
    }

    // NOTE: This approach breaks invariance but for this project is fine.
    // Refactor later to use DDD unit of work pattern or repository pattern with transactions.
    const userAggregate = await this.getUserAggregate(data.userId);

    const newRacer = RacerMapper.toDomain(data);

    // Create the racer first so the repository assigns its ID, then link it
    // to the user. Previously assignRacer was called before create(), meaning
    // user.racerId was set to undefined and the user update was a no-op.
    let savedRacer;

    try {
      savedRacer = await this.racerRepository.create(newRacer);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to create racer",
        { operation: "createRacer", userId: data.userId },
        error,
      );
    }

    userAggregate.assignRacer(savedRacer);

    try {
      await this.userRepository.update(data.userId, userAggregate.getUser());
    } catch (error) {
      throw mapWriteFailure(
        "Failed to link racer to user",
        { operation: "linkRacerToUser", userId: data.userId, racerId: savedRacer.id },
        error,
      );
    }

    return RacerMapper.toResponse(savedRacer);
  }

  async update(id: string, data: RacerUpdateInput): Promise<Racer> {
    const racerToUpdate = await this.racerRepository.findById(id);
    if (!racerToUpdate) {
      throw new NotFoundError(`Racer with ID ${id} not found`, { resource: "racer", racerId: id });
    }

    racerToUpdate.update({ ...data });

    try {
      const updatedRacer = await this.racerRepository.update(id, racerToUpdate);
      return RacerMapper.toResponse(updatedRacer);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to update racer",
        { operation: "updateRacer", racerId: id },
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const racerToDelete = await this.racerRepository.findById(id);
    if (!racerToDelete) {
      throw new NotFoundError(`Racer with ID ${id} not found`, { resource: "racer", racerId: id });
    }
    try {
      await this.racerRepository.delete(id);
    } catch (error) {
      throw mapWriteFailure(
        "Failed to delete racer",
        { operation: "deleteRacer", racerId: id },
        error,
      );
    }
  }

  async getStats(id: string): Promise<any> {
    throw new NotImplemented("Racer stats are not implemented", { racerId: id });
  }

  async getUserAggregate(userId: string): Promise<UserAggregate> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found", { resource: "user", userId });
    }
    const racer = await this.racerRepository.findById(userId);
    return new UserAggregate(user, racer);
  }
}
