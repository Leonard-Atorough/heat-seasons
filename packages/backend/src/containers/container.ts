import { JsonStorageAdapter } from "../storage";

import { AuthRepository } from "../api/auth";
import { IAuthRepository } from "../api/auth/auth.repository.interface";
import { AuthController } from "../api/auth";
import { AuthService } from "../api/auth/";
import { IAuthService } from "../api/auth/auth.service.interface";

import { RacerRepository } from "../api/racer";
import { IRacerRepository } from "../api/racer/racer.repository.interface.js";
import { RacerController } from "../api/racer";
import { RacerService } from "../api/racer";
import { IRacerService } from "../api/racer/racer.service.interface.js";

import { RaceRepository } from "../api/race";
import { IRaceRepository } from "../api/race/race.repository.interface.js";
import { RaceController } from "../api/race";
import { RaceService } from "../api/race";
import { IRaceService } from "../api/race/race.service.interface.js";

import { SeasonRepository } from "../api/season";
import { ISeasonRepository } from "../api/season/season.repository.interface.js";
import { SeasonController } from "../api/season";
import { SeasonService } from "../api/season";
import { ISeasonService } from "../api/season/season.service.interface.js";

import { LeaderboardRepository } from "../api/leaderboard";
import { ILeaderboardRepository } from "../api/leaderboard/leaderboard.repository.interface.js";
import { LeaderboardController } from "../api/leaderboard";
import { LeaderboardService } from "../api/leaderboard";
import { ILeaderboardService } from "../api/leaderboard/leaderboard.service.interface.js";

class Container {
  private static instance: Container | null = null;
  private storageAdapter: JsonStorageAdapter;
  private repositories: Map<string, any> = new Map();

  private constructor() {
    this.storageAdapter = new JsonStorageAdapter("./data");
  }

  public static getInstance(): Container {
    if (Container.instance === null) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public async initializeStorageAdapter(): Promise<void> {
    await this.storageAdapter.initialize();
  }

  public getStorageAdapter(): JsonStorageAdapter {
    return this.storageAdapter;
  }

  createAuthController(): AuthController {
    const repository: IAuthRepository = this.getRepository<IAuthRepository>("AuthRepository");
    const service: IAuthService = new AuthService(repository);
    return new AuthController(service);
  }

  createRacerController(): RacerController {
    const repository: IRacerRepository = this.getRepository<IRacerRepository>("RacerRepository");
    const service: IRacerService = new RacerService(repository);
    return new RacerController(service);
  }

  createRaceController(): RaceController {
    const repository: IRaceRepository = this.getRepository<IRaceRepository>("RaceRepository");
    const service: IRaceService = new RaceService(repository);
    return new RaceController(service);
  }

  createSeasonController(): SeasonController {
    const repository: ISeasonRepository = this.getRepository<ISeasonRepository>("SeasonRepository");
    const service: ISeasonService = new SeasonService(repository);
    return new SeasonController(service);
  }

  createLeaderboardController(): LeaderboardController {
    const seasonRepository: ISeasonRepository =
      this.getRepository<ISeasonRepository>("SeasonRepository");
    const raceRepository: IRaceRepository = this.getRepository<IRaceRepository>("RaceRepository");
    const racerRepository: IRacerRepository =
      this.getRepository<IRacerRepository>("RacerRepository");
    const service: ILeaderboardService = new LeaderboardService(
      seasonRepository,
      raceRepository,
      racerRepository,
    );
    return new LeaderboardController(service);
  }

  private initializeRepositories(): void {
    this.repositories.set("AuthRepository", new AuthRepository(this.storageAdapter));
    this.repositories.set("RacerRepository", new RacerRepository(this.storageAdapter));
    this.repositories.set("RaceRepository", new RaceRepository(this.storageAdapter));
    this.repositories.set("SeasonRepository", new SeasonRepository(this.storageAdapter));
    this.repositories.set("LeaderboardRepository", new LeaderboardRepository(this.storageAdapter));
  }

  private getRepository<T>(name: string): T {
    if (this.repositories.size === 0) {
      this.initializeRepositories();
    }
    return this.repositories.get(name) as T;
  }
}

export { Container };
export function getContainerInstance(): Container {
  return Container.getInstance();
}
