// container is a singleton class that will, in this initial implementation,
// serve as a factory for building our different features dependency chains.
// In the future, this could be extended to a full-featured dependency injection
// container if needed.

import { JsonStorageAdapter } from "../storage";

// Auth imports
import { AuthRepository } from "../api/auth";
import { IAuthRepository } from "../api/auth/auth.repository.interface";
import { AuthController } from "../api/auth";
import { AuthService } from "../api/auth/";
import { IAuthService } from "../api/auth/auth.service.interface";

// Racer imports
import { RacerRepository } from "../api/racer";
import { IRacerRepository } from "../api/racer/racer.repository.interface.js";
import { RacerController } from "../api/racer";
import { RacerService } from "../api/racer";
import { IRacerService } from "../api/racer/racer.service.interface.js";

// Race imports
import { RaceRepository } from "../api/race";
import { IRaceRepository } from "../api/race/race.repository.interface.js";
import { RaceController } from "../api/race";
import { RaceService } from "../api/race";
import { IRaceService } from "../api/race/race.service.interface.js";

// Season imports
import { SeasonRepository } from "../api/season";
import { ISeasonRepository } from "../api/season/season.repository.interface.js";
import { SeasonController } from "../api/season";
import { SeasonService } from "../api/season";
import { ISeasonService } from "../api/season/season.service.interface.js";

// Leaderboard imports
import { LeaderboardRepository } from "../api/leaderboard";
import { ILeaderboardRepository } from "../api/leaderboard/leaderboard.repository.interface.js";
import { LeaderboardController } from "../api/leaderboard";
import { LeaderboardService } from "../api/leaderboard";
import { ILeaderboardService } from "../api/leaderboard/leaderboard.service.interface.js";

class container {
  private static instance: container;

  private storageAdapter: JsonStorageAdapter;

  private constructor() {
    // Private constructor to prevent direct instantiation
    this.storageAdapter = new JsonStorageAdapter("./data");
  }

  public static getInstance(): container {
    if (!container.instance) {
      container.instance = new container();
    }
    return container.instance;
  }

  public async initializeStorageAdapter(): Promise<void> {
    await this.storageAdapter.initialize();
  }

  public getStorageAdapter(): JsonStorageAdapter {
    return this.storageAdapter;
  }

  createAuthController(): AuthController {
    const repository: IAuthRepository = new AuthRepository(this.storageAdapter);
    const service: IAuthService = new AuthService(repository);
    return new AuthController(service);
  }

  createRacerController(): RacerController {
    const repository: IRacerRepository = new RacerRepository(this.storageAdapter);
    const service: IRacerService = new RacerService(repository);
    return new RacerController(service);
  }

  createRaceController(): RaceController {
    const repository: IRaceRepository = new RaceRepository(this.storageAdapter);
    const service: IRaceService = new RaceService(repository);
    return new RaceController(service);
  }

  createSeasonController(): SeasonController {
    const repository: ISeasonRepository = new SeasonRepository(this.storageAdapter);
    const service: ISeasonService = new SeasonService(repository);
    return new SeasonController(service);
  }

  createLeaderboardController(): LeaderboardController {
    const repository: ILeaderboardRepository = new LeaderboardRepository(this.storageAdapter);
    const service: ILeaderboardService = new LeaderboardService(repository);
    return new LeaderboardController(service);
  }
}

export default container.getInstance();
