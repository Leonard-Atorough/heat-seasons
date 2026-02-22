import { JsonStorageAdapter, StorageAdapter } from "../persistence";
import { ServiceLocator } from "./serviceLocator";
import {
  AuthRepository,
  RacerRepository,
  RaceRepository,
  SeasonRepository,
} from "../persistence/repositories";
import {
  IAuthRepository,
  IRaceRepository,
  IRacerRepository,
  ISeasonRepository,
} from "../../domain/repositories";
import { AuthController, AuthService, IAuthService } from "../../api/auth";
import { AdminController } from "../../api/admin";
import { RacerController, RacerService, IRacerService } from "../../api/racer";
import { RaceController, RaceService, IRaceService } from "../../api/race";
import { SeasonController, SeasonService, ISeasonService } from "../../api/season";
import {
  LeaderboardController,
  LeaderboardService,
  ILeaderboardService,
} from "../../api/leaderboard";

class Container {
  private static instance: Container | null = null;
  private storageAdapter: StorageAdapter;
  private repositories: Map<string, any> = new Map();

  serviceLocator: ServiceLocator = new ServiceLocator();

  private constructor() {
    this.storageAdapter = new JsonStorageAdapter("./data");

    // Register services in the service locator
    const authService = new AuthService(this.getRepository<IAuthRepository>("AuthRepository"));
    this.serviceLocator.register("AuthService", authService);

    const racerService = new RacerService(
      this.getRepository<IRacerRepository>("RacerRepository"),
      this.getRepository<IAuthRepository>("AuthRepository"),
    );
    this.serviceLocator.register("RacerService", racerService);

    const raceService = new RaceService(
      this.getRepository<IRaceRepository>("RaceRepository"),
      this.getRepository<ISeasonRepository>("SeasonRepository"),
    );
    this.serviceLocator.register("RaceService", raceService);

    const seasonService = new SeasonService(
      this.getRepository<ISeasonRepository>("SeasonRepository"),
    );
    this.serviceLocator.register("SeasonService", seasonService);

    const leaderboardService = new LeaderboardService(
      this.getRepository<ISeasonRepository>("SeasonRepository"),
      this.getRepository<IRaceRepository>("RaceRepository"),
      this.getRepository<IRacerRepository>("RacerRepository"),
    );
    this.serviceLocator.register("LeaderboardService", leaderboardService);
  }

  public static getInstance(): Container {
    if (Container.instance === null) {
      Container.instance = new Container();
    }

    return Container.instance;
  }

  public async initializeStorageAdapter<T extends StorageAdapter>(): Promise<void> {
    await this.storageAdapter.initialize();
  }

  /**
   * Registers a service in the service locator. This allows us to access the service from anywhere in the application without needing to pass it through constructors or function parameters.
   *
   * @param name - The name of the service
   * @param service - The class or interface of the service
   */
  public registerService<T>(name: string, service: T): void {
    this.serviceLocator.register(name, service);
  }

  public getStorageAdapter(): StorageAdapter {
    return this.storageAdapter;
  }

  createAuthController(): AuthController {
    // Use the service locator to get the AuthService instance instead
    const service = this.serviceLocator.get<IAuthService>("AuthService");
    return new AuthController(service);
  }

  createRacerController(): RacerController {
    const service = this.serviceLocator.get<IRacerService>("RacerService");
    return new RacerController(service);
  }

  createRaceController(): RaceController {
    const service = this.serviceLocator.get<IRaceService>("RaceService");
    return new RaceController(service);
  }

  createSeasonController(): SeasonController {
    const service = this.serviceLocator.get<ISeasonService>("SeasonService");
    return new SeasonController(service);
  }

  createLeaderboardController(): LeaderboardController {
    const service = this.serviceLocator.get<ILeaderboardService>("LeaderboardService");
    return new LeaderboardController(service);
  }

  createAdminController(): AdminController {
    const service = this.serviceLocator.get<IAuthService>("AuthService");
    return new AdminController(service);
  }

  private createRepository<T>(name: string): T {
    switch (name) {
      case "AuthRepository":
        return new AuthRepository(this.storageAdapter) as unknown as T;
      case "RacerRepository":
        return new RacerRepository(this.storageAdapter) as unknown as T;
      case "RaceRepository":
        return new RaceRepository(this.storageAdapter) as unknown as T;
      case "SeasonRepository":
        return new SeasonRepository(this.storageAdapter) as unknown as T;
      default:
        throw new Error(`Repository ${name} not found`);
    }
  }

  private getRepository<T>(name: string): T {
    if (!this.repositories.has(name)) {
      this.repositories.set(name, this.createRepository<T>(name));
    }
    return this.repositories.get(name) as T;
  }

  // Public method to access repositories from outside
  public getRepositoryInstance<T>(name: string): T {
    return this.getRepository<T>(name);
  }
}

export { Container };
